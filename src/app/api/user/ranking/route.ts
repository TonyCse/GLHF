import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { logger } from "@/lib/logger";

// Function qui permet de recuperer le classement des utilisateurs.
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const schema = z.object({
    limit: z.coerce.number().int().min(1).max(100).optional(),
    offset: z.coerce.number().int().min(0).optional(),
  });
  const parsed = schema.safeParse({
    limit: searchParams.get("limit") ?? undefined,
    offset: searchParams.get("offset") ?? undefined,
  });
  if (!parsed.success) {
    return NextResponse.json({ error: "Parametres invalides" }, { status: 400 });
  }

  try {
    const users = await prisma.user.findMany({
      where: {
        isDeleted: false,
      },
      orderBy: {
        ranking: "desc",
      },
      take: parsed.data.limit ?? 50,
      skip: parsed.data.offset,
      select: {
        id: true,
        pseudo: true,
        avatarUrl: true,
        ranking: true,
      },
    });

    return NextResponse.json(users);
  } catch (err: unknown) {
    logger.error("ranking_get_erreur", { message: err instanceof Error ? err.message : String(err) });
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
