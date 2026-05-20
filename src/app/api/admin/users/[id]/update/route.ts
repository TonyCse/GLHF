import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { z } from "zod";
import { logger } from "@/lib/logger";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// Function qui permet de mettre a jour un utilisateur.
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const session = await auth();

  if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
    return NextResponse.json({ error: "Accès interdit" }, { status: 403 });
  }
  const isSuperAdmin = session.user.role === "SUPER_ADMIN";

  const resolvedParams = await Promise.resolve(params as unknown as { id?: string });
  const idFromParams = resolvedParams?.id;
  const idFromPath = new URL(request.url).pathname.split("/").filter(Boolean).slice(-2, -1)[0];
  const idSchema = z.coerce.number().int().positive();
  const parsedId = idSchema.safeParse(idFromParams ?? idFromPath);
  if (!parsedId.success) {
    return NextResponse.json({ error: "ID utilisateur invalide" }, { status: 400 });
  }
  const userId = parsedId.data;

  try {
    const schema = z.object({
      pseudo: z.string().min(1).regex(/^[a-zA-Z0-9._-]{3,20}$/, "Pseudo invalide (3-20 caractères alphanumériques, points, tirets)"),
      email: z.string().email(),
      avatarUrl: z.string().optional(),
      role: z.enum(["USER", "ADMIN", "SUPER_ADMIN"]),
      tournamentsWon: z.coerce.number().int().min(0).optional(),
      matchesWon: z.coerce.number().int().min(0).optional(),
      ranking: z.coerce.number().int().min(0).optional(),
      tokensUsedThisMonth: z.coerce.number().int().optional(),
    });
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Champs invalides" }, { status: 400 });
    }
    const {
      pseudo,
      email,
      avatarUrl,
      role,
      tournamentsWon,
      matchesWon,
      ranking,
      tokensUsedThisMonth,
    } = parsed.data;

    // Validation basique
    if (!pseudo || !email) {
      return NextResponse.json({ error: "Pseudo et email sont requis" }, { status: 400 });
    }

    if (!["USER", "ADMIN", "SUPER_ADMIN"].includes(role)) {
      return NextResponse.json({ error: "Role invalide" }, { status: 400 });
    }

    // Verifier que l'utilisateur existe
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
    }
    if (existingUser.role === "SUPER_ADMIN" && !isSuperAdmin) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }
    if (role === "SUPER_ADMIN" && !isSuperAdmin) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    // Verifier l'unicite du pseudo et de l'email (sauf pour l'utilisateur actuel)
    const pseudoConflict = await prisma.user.findFirst({
      where: {
        pseudo,
        id: { not: userId },
        isDeleted: false,
      },
    });

    if (pseudoConflict) {
      return NextResponse.json({ error: "Ce pseudo est déjà utilisé" }, { status: 400 });
    }

    const emailConflict = await prisma.user.findFirst({
      where: {
        email,
        id: { not: userId },
        isDeleted: false,
      },
    });

    if (emailConflict) {
      return NextResponse.json({ error: "Cet email est déjà utilisé" }, { status: 400 });
    }

    // Mettre a jour l'utilisateur
    const parsedTokensUsed =
      tokensUsedThisMonth !== undefined ? parseInt(String(tokensUsedThisMonth), 10) : undefined;
    const normalizedTokensUsed =
      parsedTokensUsed !== undefined && Number.isFinite(parsedTokensUsed)
        ? Math.max(0, parsedTokensUsed)
        : undefined;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        pseudo,
        email,
        avatarUrl: avatarUrl || "",
        role: role as Role,
        ...(tournamentsWon !== undefined ? { tournamentsWon: Math.max(0, tournamentsWon) } : {}),
        ...(matchesWon !== undefined ? { matchesWon: Math.max(0, matchesWon) } : {}),
        ...(ranking !== undefined ? { ranking: Math.max(0, ranking) } : {}),
        ...(normalizedTokensUsed !== undefined
          ? { tokensUsedThisMonth: normalizedTokensUsed }
          : {}),
      },
      select: {
        id: true,
        pseudo: true,
        email: true,
        tokensUsedThisMonth: true,
        role: true,
      },
    });

    return NextResponse.json({
      message: "Utilisateur mis à jour avec succès",
      user: updatedUser,
    });
  } catch (err: unknown) {
    logger.error("admin_user_update_erreur", { message: err instanceof Error ? err.message : String(err) });
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
