import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// 🎯 Enregistrer un gagnant
export async function POST(req: Request) {
  const { tournamentId, round, matchIndex, winnerId } = await req.json();

  if (!tournamentId || round === undefined || matchIndex === undefined || !winnerId) {
    return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });
  }

  try {
    let match = await prisma.match.findFirst({
      where: { tournamentId, round, matchIndex },
      include: { winner: true },
    });

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

    await prisma.user.update({
      where: { id: winnerId },
      data: {
        matchesWon: { increment: 1 },
        ranking: { increment: 1 },
      },
    });

    const isFinal = !(await prisma.match.findFirst({
      where: { tournamentId, round: { gt: round } },
    }));

    if (isFinal && matchIndex === 0) {
      await prisma.user.update({
        where: { id: winnerId },
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
        winner: match.winner
          ? { id: match.winner.id, pseudo: match.winner.pseudo }
          : null,
      },
    });
  } catch (error: unknown) {
    console.error("Erreur serveur dans POST /api/match/update :", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Erreur serveur" }, { status: 500 });
  }
}

// 🧨 Supprimer un gagnant
export async function DELETE(req: Request) {
  const { tournamentId, round, matchIndex } = await req.json();

  if (!tournamentId || round === undefined || matchIndex === undefined) {
    return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });
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

    await prisma.user.update({
      where: { id: winnerId },
      data: {
        matchesWon: { decrement: 1 },
        ranking: { decrement: 1 },
      },
    });

    const isFinal = !(await prisma.match.findFirst({
      where: { tournamentId, round: { gt: round } },
    }));

    if (isFinal && matchIndex === 0) {
      await prisma.user.update({
        where: { id: winnerId },
        data: {
          tournamentsWon: { decrement: 1 },
          ranking: { decrement: 3 },
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur serveur dans DELETE /api/match/update :", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
