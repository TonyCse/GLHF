import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { logger } from "@/lib/logger";

// Function qui permet de recuperer un utilisateur par email.
export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");

  const emailSchema = z.string().email();
  if (!email || !emailSchema.safeParse(email).success) {
    return NextResponse.json({ error: "Email requis" }, { status: 400 });
  }

  try {
    const user = await prisma.user.findFirst({
      where: { email, isDeleted: false },
      include: {
        createdTournaments: { where: { isDeleted: false } },
        matchHistory: {
          where: { tournament: { isDeleted: false } },
          include: { tournament: true },
        },
        plan: true,
        tournamentParticipations: {
          where: { isActive: true },
          include: {
            tournament: {
              include: {
                matches: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
    }

    // Mapper les participations vers l'ancien format pour la compatibilite
    const joinedTournaments = user.tournamentParticipations.map(
      (participation) => participation.tournament,
    );

    return NextResponse.json(
      {
        id: user.id,
        pseudo: user.pseudo,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt,
        joinedTournaments,
        createdTournaments: user.createdTournaments,
        tournamentsWon: user.tournamentsWon ?? 0,
        ranking: user.ranking ?? 0,
        matchHistory: user.matchHistory ?? [],
        plan: user.plan
          ? {
              id: user.plan.id,
              name: user.plan.name,
              slug: user.plan.slug,
              priceCents: user.plan.priceCents,
              currency: user.plan.currency,
              tokensPerMonth: user.plan.tokensPerMonth,
            }
          : null,
      },
      {
        headers: { "Cache-Control": "no-store" },
      },
    );
  } catch (err: unknown) {
    logger.error("user_get_erreur", { message: err instanceof Error ? err.message : String(err) });
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findFirst({
      where: { email: session.user.email, isDeleted: false },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { isDeleted: true },
    });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    logger.error("user_delete_erreur", { message: err instanceof Error ? err.message : String(err) });
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
