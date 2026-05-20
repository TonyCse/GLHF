import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { logger } from "@/lib/logger";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const resolvedParams = await params;
  const idSchema = z.coerce.number().int().positive();
  const parsedId = idSchema.safeParse(resolvedParams.id);
  if (!parsedId.success) {
    return NextResponse.json({ error: "ID invalide" }, { status: 400 });
  }
  const tournamentId = parsedId.data;

  try {
    // Vérifier que le tournoi existe et que l'utilisateur est le créateur
    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId, isDeleted: false },
      include: { createdBy: { select: { email: true, isDeleted: true } } },
    });

    if (!tournament) {
      return NextResponse.json({ error: "Tournoi introuvable" }, { status: 404 });
    }

    if (tournament.createdBy.isDeleted || tournament.createdBy.email !== session.user.email) {
      return NextResponse.json({ error: "Accès interdit" }, { status: 403 });
    }

    let payload: unknown = null;
    try {
      payload = await req.json();
    } catch {
      return NextResponse.json({ error: "Payload invalide" }, { status: 400 });
    }

    const schema = z.object({
      winnerId: z.coerce.number().int().positive().optional().nullable(),
    });
    const parsed = schema.safeParse(payload);
    if (!parsed.success) {
      return NextResponse.json({ error: "Payload invalide" }, { status: 400 });
    }

    const { winnerId } = parsed.data;

    if (winnerId) {
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

      const winner = await prisma.user.findUnique({
        where: { id: winnerId },
        select: { id: true, isDeleted: true },
      });

      if (!winner || winner.isDeleted) {
        return NextResponse.json({ error: "Gagnant invalide ou supprimé" }, { status: 400 });
      }

      const isParticipant = await prisma.tournamentParticipant.findFirst({
        where: { tournamentId, userId: winnerId, isActive: true },
      });

      if (!isParticipant) {
        return NextResponse.json({ error: "Le gagnant doit être un participant du tournoi" }, { status: 400 });
      }
    }

    const updated = await prisma.tournament.update({
      where: { id: tournamentId },
      data: { winnerId: winnerId ?? null },
    });

    return NextResponse.json({ success: true, tournament: updated });
  } catch (err: unknown) {
    logger.error("tournament_winner_erreur", { message: err instanceof Error ? err.message : String(err) });
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
