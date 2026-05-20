import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { Game } from "@prisma/client";
import { logger } from "@/lib/logger";

// Function qui permet de mettre a jour un tournoi.
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const resolvedParams = await Promise.resolve(params as unknown as { id?: string });
  const idFromParams = resolvedParams?.id;
  const idFromPath = new URL(request.url).pathname.split("/").filter(Boolean).slice(-2, -1)[0];
  const id = idFromParams ?? idFromPath;

  if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const idSchema = z.coerce.number().int().positive();
  const parsedId = idSchema.safeParse(id);
  if (!parsedId.success) {
    return NextResponse.json({ error: "ID invalide" }, { status: 400 });
  }
  const tournamentId = parsedId.data;

  try {
    const schema = z.object({
      name: z.string().min(1),
      description: z.string().optional().nullable(),
      game: z.nativeEnum(Game),
      maxPlayers: z.coerce.number().int().min(2).max(64),
      date: z.string().min(1),
    });
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 });
    }
    const { name, description, game, maxPlayers, date } = parsed.data;
    const maxPlayersNum = maxPlayers;

    // Valider la date
    const tournamentDate = new Date(date);
    if (isNaN(tournamentDate.getTime())) {
      return NextResponse.json({ error: "Date invalide" }, { status: 400 });
    }

    // Verifier que le tournoi existe
    const existingTournament = await prisma.tournament.findUnique({
      where: { id: tournamentId, isDeleted: false },
      include: {
        participants: {
          where: { isActive: true },
        },
      },
    });

    if (!existingTournament) {
      return NextResponse.json({ error: "Tournoi introuvable" }, { status: 404 });
    }

    // Verifier que le nouveau maxPlayers n'est pas inferieur au nombre de participants actuels
    const currentParticipants = existingTournament.participants.length;
    if (maxPlayersNum < currentParticipants) {
      return NextResponse.json(
        {
          error: `Impossible de réduire la capacité en dessous du nombre de participants actuels (${currentParticipants})`,
        },
        { status: 400 },
      );
    }

    // Mettre a jour le tournoi
    const updatedTournament = await prisma.tournament.update({
      where: { id: tournamentId },
      data: {
        name,
        description: description || null,
        game,
        maxPlayers: maxPlayersNum,
        date: tournamentDate,
      },
    });

    return NextResponse.json({
      message: "Tournoi mis à jour avec succès",
      tournament: updatedTournament,
    });
  } catch (err: unknown) {
    logger.error("admin_tournament_update_erreur", { message: err instanceof Error ? err.message : String(err) });
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
