import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";
import { logger } from "@/lib/logger";

const PSEUDO_REGEX = /^[a-zA-Z0-9._-]{3,20}$/;

// Function qui permet de recuperer un utilisateur par pseudo.
export async function GET(_: Request, { params }: { params: Promise<{ pseudo: string }> }) {
  const { pseudo } = await params;
  const schema = z.object({
    pseudo: z.string().min(3).max(20).regex(PSEUDO_REGEX),
  });
  const parsed = schema.safeParse({ pseudo });
  if (!parsed.success) {
    return NextResponse.json({ error: "Pseudo invalide" }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: {
        pseudo: parsed.data.pseudo,
        isDeleted: false, // Exclure les utilisateurs supprimes
      },
      include: {
        tournamentParticipations: {
          where: { isActive: true, tournament: { isDeleted: false } },
          include: {
            tournament: {
              include: { matches: true },
            },
          },
        },
        createdTournaments: { where: { isDeleted: false } },
        matchHistory: {
          where: { tournament: { isDeleted: false } },
          include: { tournament: true },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
    }

    // Mapper les participations vers l'ancien format pour la compatibilite
    const joinedTournaments = user.tournamentParticipations.map(
      (participation) => participation.tournament,
    );

    return NextResponse.json({
      id: user.id,
      pseudo: user.pseudo,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
      joinedTournaments,
      createdTournaments: user.createdTournaments,
      tournamentsWon: user.tournamentsWon ?? 0,
      ranking: user.ranking ?? 0,
      matchHistory: user.matchHistory,
    });
  } catch (err: unknown) {
    logger.error("user_pseudo_get_erreur", { message: err instanceof Error ? err.message : String(err) });
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
