import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const session = await auth();

  if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  const resolvedParams = await Promise.resolve(params as unknown as { id?: string });
  const idFromParams = resolvedParams?.id;
  const idFromPath = new URL(request.url).pathname.split("/").filter(Boolean).slice(-2, -1)[0];
  const tournamentId = Number(idFromParams ?? idFromPath);

  if (!Number.isFinite(tournamentId)) {
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


