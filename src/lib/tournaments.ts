import { prisma } from "@/lib/prisma";
import type { Game } from "@prisma/client";

export type TournamentListItem = {
  id: number;
  name: string;
  description?: string | null;
  maxPlayers: number;
  date: string;
  game: string;
  createdAt: string;
  participantsCount: number;
  createdBy?: {
    pseudo: string;
  };
  winner?: {
    id: number;
    pseudo: string;
    avatarUrl?: string | null;
  } | null;
};

export async function getTournamentList(options?: { game?: Game }): Promise<TournamentListItem[]> {
  const tournois = await prisma.tournament.findMany({
    where: { isDeleted: false, ...(options?.game ? { game: options.game } : {}) },
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
        select: {
          id: true,
        },
      },
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

  return tournois.map((tournoi) => ({
    id: tournoi.id,
    name: tournoi.name,
    description: tournoi.description,
    maxPlayers: tournoi.maxPlayers,
    date: tournoi.date.toISOString(),
    game: tournoi.game,
    createdAt: tournoi.createdAt.toISOString(),
    participantsCount: tournoi.participants.length,
    createdBy: tournoi.createdBy?.isDeleted
      ? { pseudo: "Utilisateur introuvable" }
      : { pseudo: tournoi.createdBy?.pseudo || "Inconnu" },
    winner: tournoi.winner?.isDeleted
      ? { id: tournoi.winner.id, pseudo: "Utilisateur introuvable", avatarUrl: null }
      : tournoi.winner
        ? {
            id: tournoi.winner.id,
            pseudo: tournoi.winner.pseudo,
            avatarUrl: tournoi.winner.avatarUrl || null,
          }
        : null,
  }));
}
