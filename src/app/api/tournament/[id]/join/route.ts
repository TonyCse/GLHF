import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { refreshUserTokensIfNeeded, refundToken } from "@/lib/tokens";
import { z } from "zod";
import { logger } from "@/lib/logger";

// Function qui permet de gerer l'inscription et le desinscription a un tournoi.
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const resolvedParams = await params;
  const idSchema = z.coerce.number().int().positive();
  const parsedId = idSchema.safeParse(resolvedParams.id);
  if (!parsedId.success) {
    return NextResponse.json({ error: "ID invalide" }, { status: 400 });
  }
  const tournoiId = parsedId.data;

  const schema = z.object({
    action: z.enum(["join", "leave"]).default("join"),
  });
  let payload: unknown = {};
  try {
    const rawBody = await req.text();
    payload = rawBody ? JSON.parse(rawBody) : {};
  } catch {
    return NextResponse.json({ error: "Payload invalide" }, { status: 400 });
  }
  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "Payload invalide" }, { status: 400 });
  }
  const action: "join" | "leave" = parsed.data.action ?? "join";

  try {
    const user = await prisma.user.findFirst({
      where: { email: session.user.email, isDeleted: false },
    });

    if (!user) {
      return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
    }

    // Action leave : remboursement si tournoi pas commence
    if (action === "leave") {
      const tournament = await prisma.tournament.findUnique({
        where: { id: tournoiId, isDeleted: false },
        select: { date: true },
      });

      if (!tournament) {
        return NextResponse.json({ error: "Tournoi introuvable" }, { status: 404 });
      }

      const tournamentHasStarted = tournament.date <= new Date();

      const leaveResult = await prisma.tournamentParticipant.updateMany({
        where: {
          tournamentId: tournoiId,
          userId: user.id,
          isActive: true,
        },
        data: {
          isActive: false,
        },
      });

      // Rembourser le token seulement si une participation active a vraiment ete retiree
      if (!tournamentHasStarted && leaveResult.count > 0) {
        await refundToken(user.id);
      }

      return NextResponse.json({
        success: true,
        refunded: !tournamentHasStarted,
      });
    }

    // Action join : gestion des tokens

    // 1) On rafraichit les tokens (reset si nouveau mois)
    const userWithTokens = await refreshUserTokensIfNeeded(user.id);
    const tokenLimit = userWithTokens.plan?.tokensPerMonth ?? 3;

    // 2) On regarde la participation existante
    const existingParticipation = await prisma.tournamentParticipant.findUnique({
      where: {
        tournamentId_userId: {
          tournamentId: tournoiId,
          userId: user.id,
        },
      },
    });

    // Si deja actif -> rien a faire, pas de token consomme
    if (existingParticipation?.isActive) {
      return NextResponse.json({ success: true });
    }

    // 3) On fait tout dans une transaction :
    //    - (re)activer / creer la participation
    //    - incrementer tokensUsedThisMonth
    await prisma.$transaction(async (tx) => {
      if (existingParticipation) {
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
        // Premiere fois qu'il rejoint ce tournoi :
        // -> on peut en profiter pour verifier que le tournoi n'est pas plein
        const tournament = await tx.tournament.findUnique({
          where: { id: tournoiId, isDeleted: false },
          include: {
            participants: {
              where: { isActive: true },
            },
          },
        });

        if (!tournament) {
          throw new Error("Tournoi introuvable");
        }

        if (tournament.maxPlayers && tournament.participants.length >= tournament.maxPlayers) {
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

      // Consommer 1 token pour ce join (creation OU reactivation)
      const consumeResult = await tx.user.updateMany({
        where: {
          id: user.id,
          tokensUsedThisMonth: {
            lt: tokenLimit,
          },
        },
        data: {
          tokensUsedThisMonth: {
            increment: 1,
          },
        },
      });

      if (consumeResult.count === 0) {
        throw new Error(
          "Tu as utilisé tous tes tokens ce mois-ci. Reviens le mois prochain ou prends un forfait premium.",
        );
      }
    });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    if (message === "Tournoi introuvable") return NextResponse.json({ error: message }, { status: 404 });
    if (message === "Le tournoi est complet") return NextResponse.json({ error: message }, { status: 400 });
    if (message.startsWith("Tu as utilisé tous")) return NextResponse.json({ error: message }, { status: 403 });
    logger.error("tournament_join_erreur", { message });
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
