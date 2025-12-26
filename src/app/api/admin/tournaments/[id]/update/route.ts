import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  const { id } = await params;

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const tournamentId = parseInt(id, 10);
  if (!tournamentId) {
    return NextResponse.json({ error: "ID invalide" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { name, description, game, maxPlayers, date } = body;

    // Validation
    if (!name || !game || maxPlayers === undefined || maxPlayers === null || !date) {
      return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 });
    }

    const maxPlayersNum = parseInt(maxPlayers.toString(), 10);
    if (isNaN(maxPlayersNum) || maxPlayersNum < 2 || maxPlayersNum > 64) {
      return NextResponse.json({ error: "Le nombre de joueurs doit être entre 2 et 64" }, { status: 400 });
    }

    // Vérifier que le tournoi existe
    const existingTournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
      include: {
        participants: {
          where: { isActive: true }
        }
      }
    });

    if (!existingTournament) {
      return NextResponse.json({ error: "Tournoi introuvable" }, { status: 404 });
    }

    // Vérifier que le nouveau maxPlayers n'est pas inférieur au nombre de participants actuels
    const currentParticipants = existingTournament.participants.length;
    if (maxPlayersNum < currentParticipants) {
      return NextResponse.json(
        { error: `Impossible de réduire la capacité en dessous du nombre de participants actuels (${currentParticipants})` },
        { status: 400 }
      );
    }

    // Mettre à jour le tournoi
    const updatedTournament = await prisma.tournament.update({
      where: { id: tournamentId },
      data: {
        name,
        description: description || null,
        game,
        maxPlayers: maxPlayersNum,
        date: new Date(date),
      },
    });

    return NextResponse.json({
      message: "Tournoi mis à jour avec succès",
      tournament: updatedTournament,
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du tournoi:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
