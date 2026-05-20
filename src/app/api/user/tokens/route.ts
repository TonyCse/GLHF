import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { refreshUserTokensIfNeeded } from "@/lib/tokens";
import { z } from "zod";
import { logger } from "@/lib/logger";

// Function qui permet de recuperer les tokens de l'utilisateur.
export async function GET() {
  const session = await auth();

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findFirst({
      where: { email: session.user.email, isDeleted: false },
      include: { plan: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
    }

    // Rafraichir les tokens si necessaire (nouveau mois)
    const userWithTokens = await refreshUserTokensIfNeeded(user.id);
    const tokensPerMonth = userWithTokens.plan?.tokensPerMonth ?? 3;
    const rawUsedTokens = userWithTokens.tokensUsedThisMonth;
    const bonusTokens = Math.max(0, -rawUsedTokens);
    const totalTokensThisMonth = tokensPerMonth + bonusTokens;
    const usedTokens = Math.min(Math.max(0, rawUsedTokens), totalTokensThisMonth);
    const remainingTokens = Math.max(0, totalTokensThisMonth - usedTokens);

    return NextResponse.json(
      {
        success: true,
        data: {
          remainingTokens,
          usedTokens,
          totalTokensThisMonth,
          plan: userWithTokens.plan?.name ?? "Plan Gratuit",
          monthStart: userWithTokens.tokensMonthStart,
        },
      },
      {
        headers: { "Cache-Control": "no-store" },
      },
    );
  } catch (err: unknown) {
    logger.error("user_tokens_get_erreur", { message: err instanceof Error ? err.message : String(err) });
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// Function qui permet de forcer un reset mensuel (admin uniquement).
export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  try {
    let payload: unknown = null;
    try {
      payload = await req.json();
    } catch {
      return NextResponse.json({ error: "Payload invalide" }, { status: 400 });
    }

    const schema = z.object({
      action: z.enum(["resetAllTokens"]),
    });
    const parsed = schema.safeParse(payload);
    if (!parsed.success) {
      return NextResponse.json({ error: "Action non reconnue" }, { status: 400 });
    }

    const { action } = parsed.data;

    if (action === "resetAllTokens") {
      const currentMonthStart = new Date();
      currentMonthStart.setDate(1);
      currentMonthStart.setHours(0, 0, 0, 0);

      await prisma.user.updateMany({
        data: {
          tokensUsedThisMonth: 0,
          tokensMonthStart: currentMonthStart,
        },
      });

      return NextResponse.json({
        success: true,
        message: "Tokens de tous les utilisateurs réinitialisés",
      });
    }

    return NextResponse.json({ error: "Action non reconnue" }, { status: 400 });
  } catch (err: unknown) {
    logger.error("user_tokens_post_erreur", { message: err instanceof Error ? err.message : String(err) });
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
