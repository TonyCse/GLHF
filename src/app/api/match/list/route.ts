import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const tournamentId = parseInt(searchParams.get("tournamentId") || "", 10);

  if (!tournamentId) {
    return NextResponse.json({ error: "Paramètre tournamentId manquant" }, { status: 400 });
  }

  try {
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
  } catch (error) {
    console.error("Erreur dans /api/match/list :", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
