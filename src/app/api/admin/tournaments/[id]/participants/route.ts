import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const session = await auth();

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { id } = await params;
  const tournamentId = parseInt(id, 10);

  if (!tournamentId) {
    return NextResponse.json({ error: "ID de tournoi invalide" }, { status: 400 });
  }

  try {
    const { userId, action } = await request.json();

    if (!userId || !action) {
      return NextResponse.json({ error: "Données manquantes" }, { status: 400 });
    }

    // Vérifier que le tournoi existe
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

    // Vérifier que l'utilisateur existe
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
      // Vérifier que le tournoi n'est pas complet
      if (tournament.participants.length >= tournament.maxPlayers) {
        return NextResponse.json({ error: "Le tournoi est complet" }, { status: 400 });
      }

      // Vérifier que l'utilisateur n'est pas déjà participant
      const existingParticipation = await prisma.tournamentParticipant.findFirst({
        where: {
          tournamentId,
          userId,
        },
      });

      if (existingParticipation) {
        if (existingParticipation.isActive) {
          return NextResponse.json({ error: "L'utilisateur participe déjà à ce tournoi" }, { status: 400 });
        } else {
          // Réactiver la participation
          await prisma.tournamentParticipant.update({
            where: { id: existingParticipation.id },
            data: { isActive: true, joinedAt: new Date() },
          });
        }
      } else {
        // Créer une nouvelle participation
        const participant = await prisma.tournamentParticipant.create({
          data: {
            tournamentId,
            userId,
            isActive: true,
          },
        });
      }

      return NextResponse.json({ 
        message: "Participant ajouté avec succès", 
        participantId: existingParticipation?.id || participant?.id
      });
    } else if (action === "remove") {
      // Désactiver la participation
      const participation = await prisma.tournamentParticipant.findFirst({
        where: {
          tournamentId,
          userId,
          isActive: true,
        },
      });

      if (!participation) {
        return NextResponse.json({ error: "L'utilisateur ne participe pas à ce tournoi" }, { status: 400 });
      }

      await prisma.tournamentParticipant.update({
        where: { id: participation.id },
        data: { isActive: false },
      });

      return NextResponse.json({ message: "Participant supprimé avec succès" });
    } else {
      return NextResponse.json({ error: "Action non valide" }, { status: 400 });
    }
  } catch (error) {
    console.error("Erreur lors de la gestion des participants:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
