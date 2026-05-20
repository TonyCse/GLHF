import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { logger } from "@/lib/logger";

// Function qui permet de recuperer un tournoi.
export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  const idSchema = z.coerce.number().int().positive();
  const parsedId = idSchema.safeParse(params.id);
  if (!parsedId.success) {
    return NextResponse.json({ error: "ID invalide" }, { status: 400 });
  }
  const id = parsedId.data;

  try {
    const tournoi = await prisma.tournament.findFirst({
      where: { id, isDeleted: false },
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
                avatarUrl: true,
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

    // Afficher "Utilisateur introuvable" pour les utilisateurs supprimes
    const tournoiFiltered = {
      ...tournoi,
      createdBy: tournoi.createdBy?.isDeleted
        ? {
            pseudo: "Utilisateur introuvable",
          }
        : tournoi.createdBy,
      participants: tournoi.participants.map((participation) => ({
        id: participation.user.id,
        pseudo: participation.user.isDeleted
          ? "Utilisateur introuvable"
          : participation.user.pseudo,
        avatarUrl: participation.user.avatarUrl,
        isDeleted: participation.user.isDeleted,
        joinedAt: participation.joinedAt,
        isActive: participation.isActive,
      })),
    };

    return NextResponse.json(tournoiFiltered);
  } catch (err: unknown) {
    logger.error("tournament_get_erreur", { message: err instanceof Error ? err.message : String(err) });
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// Function qui permet de supprimer un tournoi.
export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  const session = await auth();

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const params = await context.params;
  const idSchema = z.coerce.number().int().positive();
  const parsedId = idSchema.safeParse(params.id);
  if (!parsedId.success) {
    return NextResponse.json({ error: "ID invalide" }, { status: 400 });
  }
  const id = parsedId.data;

  let tournoi;
  try {
    tournoi = await prisma.tournament.findUnique({
      where: { id, isDeleted: false },
      include: { createdBy: true },
    });
  } catch (err: unknown) {
    logger.error("tournament_delete_find_erreur", { message: err instanceof Error ? err.message : String(err) });
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }

  if (!tournoi) {
    return NextResponse.json({ error: "Tournoi introuvable" }, { status: 404 });
  }

  if (tournoi.createdBy.isDeleted || String(tournoi.createdById) !== session.user.id) {
    return NextResponse.json({ error: "Accès interdit" }, { status: 403 });
  }

  if (tournoi.winnerId) {
    return NextResponse.json(
      { error: "Le tournoi est terminé et ne peut plus être supprimé." },
      { status: 400 },
    );
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.tournament.update({
        where: { id },
        data: { isDeleted: true },
      });

      await tx.user.updateMany({
        where: { id: tournoi.createdById, tokensUsedThisMonth: { gt: 0 } },
        data: {
          tokensUsedThisMonth: {
            decrement: 1,
          },
        },
      });
    });

    return NextResponse.json({ success: true, refunded: true });
  } catch (err: unknown) {
    logger.error("tournament_delete_erreur", { message: err instanceof Error ? err.message : String(err) });
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
