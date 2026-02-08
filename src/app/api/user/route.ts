import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");

  if (!email) {
    return NextResponse.json({ error: "Email requis" }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        createdTournaments: true,
        matchHistory: true,
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

    // Mapper les participations vers l'ancien format pour la compatibilité
    const joinedTournaments = user.tournamentParticipations.map(participation => participation.tournament);

    return NextResponse.json({
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
    }, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("Erreur GET /api/user :", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
