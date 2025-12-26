import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(_: Request, { params }: { params: Promise<{ pseudo: string }> }) {
  const { pseudo } = await params;

  try {
    const user = await prisma.user.findUnique({
      where: { 
        pseudo,
        isDeleted: false, // Exclure les utilisateurs supprimés
      },
      include: {
        tournamentParticipations: {
          where: { isActive: true },
          include: {
            tournament: {
              include: { matches: true },
            },
          },
        },
        createdTournaments: true,
        matchHistory: {
          include: { tournament: true },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
    }

    // Mapper les participations vers l'ancien format pour la compatibilité
    const joinedTournaments = user.tournamentParticipations.map(participation => participation.tournament);

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
  } catch (error) {
    console.error("Erreur GET /api/user/pseudo/[pseudo] :", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
