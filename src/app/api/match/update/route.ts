import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { logger } from "@/lib/logger";

async function verifyTournamentCreator(tournamentId: number, userEmail: string) {
  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId, isDeleted: false },
    select: { createdById: true, createdBy: { select: { email: true, isDeleted: true } } },
  });
  if (!tournament) return { ok: false as const, error: "Tournoi introuvable", status: 404 };
  if (tournament.createdBy.isDeleted) return { ok: false as const, error: "Accès interdit", status: 403 };
  if (tournament.createdBy.email !== userEmail) return { ok: false as const, error: "Acc\u00e8s interdit", status: 403 };
  return { ok: true as const };
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Non autoris\u00e9" }, { status: 401 });
  }

  let payload: unknown = null;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Parametres manquants" }, { status: 400 });
  }

  const schema = z.object({
    tournamentId: z.coerce.number().int().positive(),
    round: z.coerce.number().int().min(0),
    matchIndex: z.coerce.number().int().min(0),
    winnerId: z.coerce.number().int().positive(),
  });
  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "Parametres manquants" }, { status: 400 });
  }

  const { tournamentId, round, matchIndex, winnerId } = parsed.data;

  const check = await verifyTournamentCreator(tournamentId, session.user.email);
  if (!check.ok) {
    return NextResponse.json({ error: check.error }, { status: check.status });
  }

  // Bloquer si le créateur est seul dans le tournoi
  const activeParticipants = await prisma.tournamentParticipant.count({
    where: { tournamentId, isActive: true },
  });
  if (activeParticipants < 2) {
    return NextResponse.json(
      { error: "Impossible de déclarer un vainqueur avec moins de 2 participants" },
      { status: 400 },
    );
  }

  // Vérifier que le gagnant est un participant actif et non supprimé
  const participant = await prisma.tournamentParticipant.findFirst({
    where: { tournamentId, userId: winnerId, isActive: true, user: { isDeleted: false } },
  });
  if (!participant) {
    return NextResponse.json({ error: "Le gagnant doit être un participant actif du tournoi" }, { status: 400 });
  }

  try {
    let match = await prisma.match.findFirst({
      where: { tournamentId, round, matchIndex },
      include: { winner: true },
    });

    const previousWinnerId = match?.winnerId;

    if (match) {
      match = await prisma.match.update({
        where: { id: match.id },
        data: { winnerId, updatedAt: new Date() },
        include: { winner: true },
      });
    } else {
      match = await prisma.match.create({
        data: {
          tournamentId,
          round,
          matchIndex,
          winnerId,
          playerId: winnerId,
          updatedAt: new Date(),
        },
        include: { winner: true },
      });
    }

    // Seulement incrémenter si le winner a changé
    if (previousWinnerId !== winnerId) {
      // Décrémenter l'ancien winner si existant
      if (previousWinnerId) {
        await prisma.user.updateMany({
          where: { id: previousWinnerId, matchesWon: { gt: 0 }, ranking: { gt: 0 } },
          data: {
            matchesWon: { decrement: 1 },
            ranking: { decrement: 1 },
          },
        });
      }

      // Incrémenter le nouveau winner
      await prisma.user.updateMany({
        where: { id: winnerId, isDeleted: false },
        data: {
          matchesWon: { increment: 1 },
          ranking: { increment: 1 },
        },
      });
    }

    // Déterminer si c'est la finale via maxPlayers du tournoi
    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
      select: { maxPlayers: true },
    });
    const totalRounds = tournament ? Math.ceil(Math.log2(tournament.maxPlayers)) : 1;
    const isFinal = round === totalRounds - 1 && matchIndex === 0;

    if (isFinal && previousWinnerId !== winnerId) {
      // Décrémenter l'ancien champion si existant
      if (previousWinnerId) {
        await prisma.user.updateMany({
          where: { id: previousWinnerId, tournamentsWon: { gt: 0 }, ranking: { gte: 3 } },
          data: {
            tournamentsWon: { decrement: 1 },
            ranking: { decrement: 3 },
          },
        });
      }

      await prisma.user.updateMany({
        where: { id: winnerId, isDeleted: false },
        data: {
          tournamentsWon: { increment: 1 },
          ranking: { increment: 3 },
        },
      });
    }

    return NextResponse.json({
      match: {
        round: match.round,
        matchIndex: match.matchIndex,
        winner: match.winner ? { id: match.winner.id, pseudo: match.winner.pseudo } : null,
      },
    });
  } catch (err: unknown) {
    logger.error("match_update_erreur", { message: err instanceof Error ? err.message : String(err) });
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Non autoris\u00e9" }, { status: 401 });
  }

  let payload: unknown = null;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Parametres manquants" }, { status: 400 });
  }

  const schema = z.object({
    tournamentId: z.coerce.number().int().positive(),
    round: z.coerce.number().int().min(0),
    matchIndex: z.coerce.number().int().min(0),
  });
  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "Parametres manquants" }, { status: 400 });
  }

  const { tournamentId, round, matchIndex } = parsed.data;

  const check = await verifyTournamentCreator(tournamentId, session.user.email);
  if (!check.ok) {
    return NextResponse.json({ error: check.error }, { status: check.status });
  }

  try {
    const match = await prisma.match.findFirst({
      where: { tournamentId, round, matchIndex },
      include: { winner: true },
    });

    if (!match || !match.winnerId) {
      return NextResponse.json({ success: true });
    }

    const winnerId = match.winnerId;

    await prisma.match.updateMany({
      where: { tournamentId, round, matchIndex },
      data: { winnerId: null, updatedAt: new Date() },
    });

    await prisma.user.updateMany({
      where: { id: winnerId, matchesWon: { gt: 0 }, ranking: { gt: 0 } },
      data: {
        matchesWon: { decrement: 1 },
        ranking: { decrement: 1 },
      },
    });

    // Déterminer si c'est la finale via maxPlayers du tournoi
    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
      select: { maxPlayers: true },
    });
    const totalRounds = tournament ? Math.ceil(Math.log2(tournament.maxPlayers)) : 1;
    const isFinal = round === totalRounds - 1 && matchIndex === 0;

    if (isFinal) {
      await prisma.user.updateMany({
        where: { id: winnerId, tournamentsWon: { gt: 0 }, ranking: { gte: 3 } },
        data: {
          tournamentsWon: { decrement: 1 },
          ranking: { decrement: 3 },
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    logger.error("match_delete_erreur", { message: err instanceof Error ? err.message : String(err) });
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
