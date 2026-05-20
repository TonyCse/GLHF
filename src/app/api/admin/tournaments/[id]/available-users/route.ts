import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { logger } from "@/lib/logger";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// Function qui permet de recuperer les utilisateurs disponibles.
export async function GET(request: NextRequest, { params }: RouteParams) {
  const session = await auth();

  if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
    return NextResponse.json({ error: "Accès interdit" }, { status: 403 });
  }

  const resolvedParams = await Promise.resolve(params as unknown as { id?: string });
  const idFromParams = resolvedParams?.id;
  const idFromPath = new URL(request.url).pathname.split("/").filter(Boolean).slice(-2, -1)[0];
  const idSchema = z.coerce.number().int().positive();
  const parsedId = idSchema.safeParse(idFromParams ?? idFromPath);
  if (!parsedId.success) {
    return NextResponse.json({ error: "ID de tournoi invalide" }, { status: 400 });
  }
  const tournamentId = parsedId.data;

  try {
    // Vérifier que le tournoi existe et n'est pas supprimé
    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
    });
    if (!tournament || tournament.isDeleted) {
      return NextResponse.json({ error: "Tournoi introuvable" }, { status: 404 });
    }

    // Recuperer les IDs des participants actuels
    const currentParticipants = await prisma.tournamentParticipant.findMany({
      where: {
        tournamentId,
        isActive: true,
      },
      select: {
        userId: true,
      },
    });

    const participantIds = currentParticipants.map((p) => p.userId);

    // Recuperer tous les utilisateurs non supprimes qui ne participent pas deja
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
      orderBy: [{ pseudo: "asc" }],
      take: 50,
    });

    return NextResponse.json(availableUsers);
  } catch (err: unknown) {
    logger.error("admin_tournament_available_users_erreur", { message: err instanceof Error ? err.message : String(err) });
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
