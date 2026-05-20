import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const schema = z.object({
    tournamentId: z.coerce.number().int().positive(),
  });
  const parsed = schema.safeParse({ tournamentId: searchParams.get("tournamentId") });
  if (!parsed.success) {
    return NextResponse.json({ error: "Paramètre tournamentId manquant" }, { status: 400 });
  }
  const tournamentId = parsed.data.tournamentId;

  try {
    // Vérifier que le tournoi existe et n'est pas supprimé
    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
    });
    if (!tournament || tournament.isDeleted) {
      return NextResponse.json({ error: "Tournoi introuvable" }, { status: 404 });
    }

    const matches = await prisma.match.findMany({
      where: { tournamentId },
      include: {
        winner: {
          select: {
            id: true,
            pseudo: true,
            isDeleted: true,
            avatarUrl: true,
          },
        },
      },
    });

    const safeMatches = matches.map((match) => ({
      round: match.round,
      matchIndex: match.matchIndex,
      winner: match.winner
        ? {
            id: match.winner.id,
            pseudo: match.winner.isDeleted ? "Utilisateur introuvable" : match.winner.pseudo,
            avatarUrl: match.winner.avatarUrl || null,
          }
        : null,
    }));

    return NextResponse.json({ matches: safeMatches });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
