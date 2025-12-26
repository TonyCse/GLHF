import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import {
  refreshUserTokensIfNeeded,
  getRemainingTokens,
  refundToken,
} from "@/lib/tokens";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const tournoiId = parseInt(params.id, 10);
  if (isNaN(tournoiId)) {
    return NextResponse.json({ error: "ID invalide" }, { status: 400 });
  }

  const body = await req.json();
  const action: "join" | "leave" = body.action ?? "join";
  const userId: number | undefined = body.userId;

  try {
    let user;

    if (userId) {
      // 🔁 Cas où on agit sur un autre utilisateur (kick / gestion admin)
      user = await prisma.user.findUnique({ where: { id: userId } });
    } else {
      // 👤 Cas par défaut : utilisateur connecté
      user = await prisma.user.findUnique({
        where: { email: session.user.email },
      });
    }

    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur introuvable" },
        { status: 404 }
      );
    }

    // ----- ACTION LEAVE : remboursement si tournoi pas commencé -----
    if (action === "leave") {
      const tournament = await prisma.tournament.findUnique({
        where: { id: tournoiId },
        select: { date: true },
      });

      if (!tournament) {
        return NextResponse.json(
          { error: "Tournoi introuvable" },
          { status: 404 }
        );
      }

      const tournamentHasStarted = tournament.date <= new Date();
      
      await prisma.tournamentParticipant.updateMany({
        where: {
          tournamentId: tournoiId,
          userId: user.id,
          isActive: true,
        },
        data: {
          isActive: false,
        },
      });

      // Rembourser le token seulement si le tournoi n'a pas commencé
      if (!tournamentHasStarted) {
        await refundToken(user.id);
      }

      return NextResponse.json({ 
        success: true,
        refunded: !tournamentHasStarted 
      });
    }

    // ----- ACTION JOIN : gestion des tokens -----

    // 1) On rafraîchit les tokens (reset si nouvelle semaine)
    const userWithTokens = await refreshUserTokensIfNeeded(user.id);
    const remaining = getRemainingTokens(userWithTokens);

    if (remaining <= 0) {
      return NextResponse.json(
        {
          error:
            "Tu as utilisé tous tes tokens ce mois-ci. Reviens le mois prochain ou prends un forfait premium.",
        },
        { status: 403 }
      );
    }

    // 2) On regarde la participation existante
    const existingParticipation =
      await prisma.tournamentParticipant.findUnique({
        where: {
          tournamentId_userId: {
            tournamentId: tournoiId,
            userId: user.id,
          },
        },
      });

    // Si déjà actif -> rien à faire, pas de token consommé
    if (existingParticipation?.isActive) {
      return NextResponse.json({ success: true });
    }

    // 3) On fait tout dans une transaction :
    //    - (ré)activer / créer la participation
    //    - incrémenter tokensUsedThisMonth
    await prisma.$transaction(async (tx) => {
      if (existingParticipation) {
        // Réactivation d'une participation existante
        await tx.tournamentParticipant.update({
          where: {
            id: existingParticipation.id,
          },
          data: {
            isActive: true,
            joinedAt: new Date(),
          },
        });
      } else {
        // Première fois qu'il rejoint ce tournoi :
        // -> on peut en profiter pour vérifier que le tournoi n'est pas plein
        const tournament = await tx.tournament.findUnique({
          where: { id: tournoiId },
          include: {
            participants: {
              where: { isActive: true },
            },
          },
        });

        if (!tournament) {
          throw new Error("Tournoi introuvable");
        }

        if (
          tournament.maxPlayers &&
          tournament.participants.length >= tournament.maxPlayers
        ) {
          throw new Error("Le tournoi est complet");
        }

        await tx.tournamentParticipant.create({
          data: {
            tournamentId: tournoiId,
            userId: user.id,
            isActive: true,
          },
        });
      }

      // Consommer 1 token pour ce join (création OU réactivation)
      await tx.user.update({
        where: { id: user.id },
        data: {
          tokensUsedThisMonth: {
            increment: 1,
          },
        },
      });
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("❌ Erreur API join :", err);
    const message =
      typeof err?.message === "string" ? err.message : "Erreur serveur";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
