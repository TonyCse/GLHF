import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import TournamentDetailClient from "./TournamentDetailClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Détail tournoi – Admin GLHF",
  description: "Détail et gestion d'un tournoi.",
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AdminTournamentDetail({ params }: Props) {
  const session = await auth();
  const { id } = await params;

  if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
    return notFound();
  }

  const tournamentId = parseInt(id, 10);
  if (!tournamentId) {
    return notFound();
  }

  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    include: {
      createdBy: {
        select: { id: true, pseudo: true, email: true, isDeleted: true },
      },
      participants: {
        include: {
          user: {
            select: {
              id: true,
              pseudo: true,
              email: true,
              avatarUrl: true,
              isDeleted: true,
              createdAt: true,
            },
          },
        },
        orderBy: { joinedAt: "asc" },
      },
      winner: {
        select: { id: true, pseudo: true, isDeleted: true },
      },
      _count: {
        select: { matches: true },
      },
    },
  });

  if (!tournament) {
    return notFound();
  }

  const tournamentForClient = {
    ...tournament,
    date: tournament.date.toISOString(),
    participants: tournament.participants.map((participant) => ({
      ...participant,
      joinedAt: participant.joinedAt.toISOString(),
      user: {
        ...participant.user,
        createdAt: participant.user.createdAt.toISOString(),
      },
    })),
  };

  const gameLabels = {
    LEAGUE_OF_LEGENDS: "League of Legends",
    VALORANT: "Valorant",
    OVERWATCH: "Overwatch",
    FALL_GUYS: "Fall Guys",
    MARVELS_RIVALS: "Marvel's Rivals",
    MINECRAFT: "Minecraft",
  };

  return <TournamentDetailClient tournament={tournamentForClient} gameLabels={gameLabels} />;
}
