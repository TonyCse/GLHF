// /src/app/api/tournament/list/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const tournois = await prisma.tournament.findMany({
      orderBy: { date: "asc" },
      include: {
        createdBy: {
          select: {
            pseudo: true,
            isDeleted: true,
          },
        },
        participants: {
          where: { isActive: true },
          include: {
            user: {
              select: {
                id: true,
                pseudo: true,
                isDeleted: true,
              },
            },
          },
        },
        winner: {
          select: {
            id: true,
            pseudo: true,
            isDeleted: true,
          },
        },
      },
    });

    // Afficher "Utilisateur introuvable" pour les utilisateurs supprimés
    const tournoisFiltered = tournois.map(tournoi => ({
      ...tournoi,
      createdBy: tournoi.createdBy?.isDeleted 
        ? { pseudo: "Utilisateur introuvable" }
        : { pseudo: tournoi.createdBy?.pseudo || "Inconnu" },
      participants: tournoi.participants.map(participation => ({
        id: participation.user.id,
        pseudo: participation.user.isDeleted ? "Utilisateur introuvable" : participation.user.pseudo,
        joinedAt: participation.joinedAt,
        isActive: participation.isActive,
      })),
      winner: tournoi.winner?.isDeleted 
        ? { id: tournoi.winner.id, pseudo: "Utilisateur introuvable" }
        : tournoi.winner 
        ? { id: tournoi.winner.id, pseudo: tournoi.winner.pseudo }
        : null,
    }));

    console.log("Tournois renvoyés :", JSON.stringify(tournoisFiltered, null, 2));

    return NextResponse.json(tournoisFiltered);
  } catch (error) {
    console.error("Erreur lors de la récupération des tournois:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
