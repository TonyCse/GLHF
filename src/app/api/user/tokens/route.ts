import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { refreshUserTokensIfNeeded, getRemainingTokens } from "@/lib/tokens";

export async function GET() {
  const session = await auth();
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { plan: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur introuvable" },
        { status: 404 }
      );
    }

    // Rafraîchir les tokens si nécessaire (nouveau mois)
    const userWithTokens = await refreshUserTokensIfNeeded(user.id);
    const tokensPerMonth = userWithTokens.plan?.tokensPerMonth ?? 3;
    const rawUsedTokens = userWithTokens.tokensUsedThisMonth;
    const bonusTokens = Math.max(0, -rawUsedTokens);
    const totalTokensThisMonth = tokensPerMonth + bonusTokens;
    const usedTokens = Math.min(Math.max(0, rawUsedTokens), totalTokensThisMonth);
    const remainingTokens = Math.max(0, totalTokensThisMonth - usedTokens);

    return NextResponse.json({
      success: true,
      data: {
        remainingTokens,
        usedTokens,
        totalTokensThisMonth,
        plan: userWithTokens.plan?.name ?? "Plan Gratuit",
        monthStart: userWithTokens.tokensMonthStart,
      },
    }, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des tokens:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

// API pour forcer le reset mensuel (admin uniquement)
export async function POST(req: Request) {
  const session = await auth();
  
  if (!session?.user || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
    return NextResponse.json({ error: "Acces refuse" }, { status: 403 });
  }

  try {
    const { action } = await req.json();

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
        message: "Tokens de tous les utilisateurs réinitialisés"
      });
    }

    return NextResponse.json(
      { error: "Action non reconnue" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Erreur lors du reset des tokens:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}


