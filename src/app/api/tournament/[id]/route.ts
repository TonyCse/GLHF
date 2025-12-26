import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(
  req: Request,
  context: { params: { id: string } }
) {
  const id = parseInt(context.params.id, 10);

  if (isNaN(id)) {
    return NextResponse.json({ error: "ID invalide" }, { status: 400 });
  }

  try {
    const tournoi = await prisma.tournament.findUnique({
      where: { id },
      include: {
        createdBy: { 
          select: { 
            pseudo: true, 
            email: true, 
            isDeleted: true 
          } 
        },
        participants: {
          where: { isActive: true },
          include: {
            user: {
              select: {
                id: true,
                pseudo: true,
                avatarUrl: true,
                email: true,
                isDeleted: true,
              },
            },
          },
        },
      },
    });

    if (!tournoi) {
      return NextResponse.json({ error: "Tournoi non trouvé" }, { status: 404 });
    }

    // Afficher "Utilisateur introuvable" pour les utilisateurs supprimés
    const tournoiFiltered = {
      ...tournoi,
      createdBy: tournoi.createdBy?.isDeleted 
        ? { 
            pseudo: "Utilisateur introuvable", 
            email: tournoi.createdBy.email 
          }
        : tournoi.createdBy,
      participants: tournoi.participants.map(participation => ({
        id: participation.user.id,
        pseudo: participation.user.isDeleted 
          ? "Utilisateur introuvable" 
          : participation.user.pseudo,
        avatarUrl: participation.user.avatarUrl,
        email: participation.user.email,
        isDeleted: participation.user.isDeleted,
        joinedAt: participation.joinedAt,
        isActive: participation.isActive,
      })),
    };

    return NextResponse.json(tournoiFiltered);
  } catch (err) {
    console.error("Erreur GET tournoi :", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  context: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const id = parseInt(context.params.id, 10);

  if (isNaN(id)) {
    return NextResponse.json({ error: "ID invalide" }, { status: 400 });
  }

  const tournoi = await prisma.tournament.findUnique({
    where: { id },
    include: { createdBy: true },
  });

  if (!tournoi) {
    return NextResponse.json({ error: "Tournoi introuvable" }, { status: 404 });
  }

  if (tournoi.createdBy.email !== session.user.email) {
    return NextResponse.json({ error: "Accès interdit" }, { status: 403 });
  }

  try {
    await prisma.tournament.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Erreur DELETE tournoi :", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
