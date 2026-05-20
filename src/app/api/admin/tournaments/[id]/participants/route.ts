import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// Function qui permet de gerer les participants d'un tournoi.
export async function POST(request: NextRequest, { params }: RouteParams) {
  const session = await auth();

  if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
    return NextResponse.json({ error: "Accès interdit" }, { status: 403 });
  }

  const resolvedParams = await Promise.resolve(params as unknown as { id?: string });
  const idFromParams = resolvedParams?.id;
  const idFromPath = new URL(request.url).pathname.split("/").filter(Boolean).slice(-2, -1)[0];
  const idSchema = z.coerce.number().int().positive();
  const parsedId = idSchema.safeParse(idFromParams ?? idFromPath);
  if (!parsedId.success) {
    return NextResponse.json({ error: "ID de tournoi invalide" }, { status: 400 });
  }
  const tournamentId = parsedId.data;

  try {
    let payload: unknown = null;
    try {
      payload = await request.json();
    } catch {
      return NextResponse.json({ error: "Données manquantes" }, { status: 400 });
    }

    const schema = z.object({
      userId: z.coerce.number().int().positive(),
      action: z.enum(["add", "remove"]),
    });
    const parsed = schema.safeParse(payload);
    if (!parsed.success) {
      return NextResponse.json({ error: "Données manquantes" }, { status: 400 });
    }
    const { userId, action } = parsed.data;

    // Verifier que le tournoi existe
    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
      include: {
        participants: {
          where: { isActive: true },
          select: { id: true },
        },
      },
    });

    if (!tournament) {
      return NextResponse.json({ error: "Tournoi non trouvé" }, { status: 404 });
    }

    if (tournament.isDeleted) {
      return NextResponse.json({ error: "Ce tournoi a été supprimé" }, { status: 400 });
    }

    // Verifier que l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, pseudo: true, isDeleted: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
    }

    if (user.isDeleted) {
      return NextResponse.json({ error: "Cet utilisateur a été supprimé" }, { status: 400 });
    }

    if (action === "add") {
      let participant: { id: number } | null = null;
      // Verifier que le tournoi n'est pas complet
      if (tournament.participants.length >= tournament.maxPlayers) {
        return NextResponse.json({ error: "Le tournoi est complet" }, { status: 400 });
      }

      // Verifier que l'utilisateur n'est pas deja participant
      const existingParticipation = await prisma.tournamentParticipant.findFirst({
        where: {
          tournamentId,
          userId,
        },
      });

      if (existingParticipation) {
        if (existingParticipation.isActive) {
          return NextResponse.json(
            { error: "L'utilisateur participe déjà à ce tournoi" },
            { status: 400 },
          );
        } else {
          // Reactiver la participation
          await prisma.tournamentParticipant.update({
            where: { id: existingParticipation.id },
            data: { isActive: true, joinedAt: new Date() },
          });
        }
      } else {
        // Creer une nouvelle participation
        participant = await prisma.tournamentParticipant.create({
          data: {
            tournamentId,
            userId,
            isActive: true,
          },
        });
      }

      return NextResponse.json({
        message: "Participant ajouté avec succès",
        participantId: existingParticipation?.id || participant?.id,
      });
    } else if (action === "remove") {
      // Desactiver la participation
      const participation = await prisma.tournamentParticipant.findFirst({
        where: {
          tournamentId,
          userId,
          isActive: true,
        },
      });

      if (!participation) {
        return NextResponse.json(
          { error: "L'utilisateur ne participe pas à ce tournoi" },
          { status: 400 },
        );
      }

      await prisma.tournamentParticipant.update({
        where: { id: participation.id },
        data: { isActive: false },
      });

      return NextResponse.json({ message: "Participant supprimé avec succès" });
    } else {
      return NextResponse.json({ error: "Action non valide" }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
