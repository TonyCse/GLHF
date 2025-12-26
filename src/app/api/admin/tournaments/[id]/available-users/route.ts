import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
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
    // Récupérer les IDs des participants actuels
    const currentParticipants = await prisma.tournamentParticipant.findMany({
      where: {
        tournamentId,
        isActive: true,
      },
      select: {
        userId: true,
      },
    });

    const participantIds = currentParticipants.map(p => p.userId);

    // Récupérer tous les utilisateurs non supprimés qui ne participent pas déjà
    const availableUsers = await prisma.user.findMany({
      where: {
        isDeleted: false,
        id: {
          notIn: participantIds,
        },
      },
      select: {
        id: true,
        pseudo: true,
        email: true,
        avatarUrl: true,
        isDeleted: true,
        createdAt: true,
      },
      orderBy: [
        { pseudo: "asc" },
      ],
    });

    return NextResponse.json(availableUsers);
  } catch (error) {
    console.error("Erreur lors de la récupération des utilisateurs disponibles:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des utilisateurs" },
      { status: 500 }
    );
  }
}




