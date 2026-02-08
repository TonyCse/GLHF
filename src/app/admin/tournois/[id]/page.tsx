import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import Link from "next/link";
import ParticipantManager from "./ParticipantManager";
import DeleteTournamentForm from "./DeleteTournamentForm";
import TournamentDetailClient from "./TournamentDetailClient";

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
        select: { id: true, pseudo: true, email: true, isDeleted: true }
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
              createdAt: true
            }
          }
        },
        orderBy: { joinedAt: "asc" }
      },
      winner: {
        select: { id: true, pseudo: true, isDeleted: true }
      },
      _count: {
        select: { matches: true }
      }
    }
  });

  if (!tournament) {
    return notFound();
  }

  const gameLabels = {
    LEAGUE_OF_LEGENDS: "League of Legends",
    VALORANT: "Valorant", 
    OVERWATCH: "Overwatch",
    FALL_GUYS: "Fall Guys",
    MARVELS_RIVALS: "Marvel's Rivals",
    MINECRAFT: "Minecraft",
  };

  return (
    <TournamentDetailClient 
      tournament={tournament}
      gameLabels={gameLabels}
    />
  );
}
