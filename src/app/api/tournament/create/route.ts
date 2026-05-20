import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Game } from "@prisma/client";
import { z } from "zod";
import { refreshUserTokensIfNeeded, getRemainingTokens } from "@/lib/tokens";
import { logger } from "@/lib/logger";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2 Mo

export async function POST(req: Request) {
  const session = await auth();

  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const formData = await req.formData();

  const name = formData.get("name");
  const description = formData.get("description");
  const maxPlayers = formData.get("maxPlayers");
  const date = formData.get("date");
  const time = formData.get("time");
  const game = formData.get("game");
  const image = formData.get("image") as File | null;

  const schema = z.object({
    name: z.string().min(1),
    description: z.string().min(1),
    maxPlayers: z.coerce.number().int().min(2).max(64),
    date: z.string().min(1),
    time: z.string().min(1),
    game: z.nativeEnum(Game),
  });
  const parsed = schema.safeParse({ name, description, maxPlayers, date, time, game });
  if (!parsed.success) {
    return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 });
  }

  const tournamentDate = new Date(`${parsed.data.date}T${parsed.data.time}`);

  if (isNaN(tournamentDate.getTime())) {
    return NextResponse.json({ error: "Date invalide" }, { status: 400 });
  }

  if (tournamentDate < new Date()) {
    return NextResponse.json({ error: "La date du tournoi doit être dans le futur" }, { status: 400 });
  }

  if (image) {
    if (!ALLOWED_IMAGE_TYPES.includes(image.type)) {
      return NextResponse.json({ error: "Type d'image non autorisé (JPEG, PNG, WebP, GIF uniquement)" }, { status: 400 });
    }
    if (image.size > MAX_IMAGE_SIZE) {
      return NextResponse.json({ error: "Image trop volumineuse (2 Mo maximum)" }, { status: 400 });
    }
  }

  try {
    const user = await prisma.user.findFirst({
      where: { email: session.user.email, isDeleted: false },
    });
    if (!user) {
      return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
    }

    const userWithTokens = await refreshUserTokensIfNeeded(user.id);
    const remaining = getRemainingTokens(userWithTokens);
    const tokenLimit = userWithTokens.plan?.tokensPerMonth ?? 3;
    if (remaining <= 0) {
      return NextResponse.json(
        {
          error:
            "Tu as utilisé tous tes tokens ce mois-ci. Reviens le mois prochain ou prends un forfait premium.",
        },
        { status: 403 },
      );
    }

    const createdTournament = await prisma.$transaction(async (tx) => {
      const consumeResult = await tx.user.updateMany({
        where: {
          id: user.id,
          tokensUsedThisMonth: {
            lt: tokenLimit,
          },
        },
        data: {
          tokensUsedThisMonth: {
            increment: 1,
          },
        },
      });

      if (consumeResult.count === 0) {
        throw new Error(
          "Tu as utilisé tous tes tokens ce mois-ci. Reviens le mois prochain ou prends un forfait premium.",
        );
      }

      const tournament = await tx.tournament.create({
        data: {
          name: parsed.data.name,
          description: parsed.data.description,
          maxPlayers: parsed.data.maxPlayers,
          date: tournamentDate,
          game: parsed.data.game,
          createdBy: { connect: { id: user.id } },
        },
      });

      return tournament;
    });

    return NextResponse.json(createdTournament, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.startsWith("Tu as utilisé tous")) {
      return NextResponse.json({ error: message }, { status: 403 });
    }
    logger.error("tournament_create_erreur", { message });
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
