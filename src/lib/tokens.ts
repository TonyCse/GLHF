// Utilitaires pour la gestion des tokens.
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

const DEFAULT_TOKENS_PER_MONTH = 3;

// Type User avec son plan inclus.
export type UserWithPlan = Prisma.UserGetPayload<{
  include: { plan: true };
}>;

// Calcule le debut du mois courant.
function getCurrentMonthStart(): Date {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  monthStart.setHours(0, 0, 0, 0);
  return monthStart;
}

// Rafraichi les tokens d'un utilisateur si besoin.
export async function refreshUserTokensIfNeeded(userId: number): Promise<UserWithPlan> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { plan: true },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const currentMonthStart = getCurrentMonthStart();

  if (!user.tokensMonthStart || user.tokensMonthStart < currentMonthStart) {
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        tokensUsedThisMonth: 0,
        tokensMonthStart: currentMonthStart,
      },
      include: { plan: true },
    });

    return updated;
  }

  return user;
}

// Calcule les tokens restants.
export function getRemainingTokens(user: UserWithPlan | null) {
  if (!user) return 0;

  const tokensPerMonth = user.plan?.tokensPerMonth ?? DEFAULT_TOKENS_PER_MONTH;
  return tokensPerMonth - user.tokensUsedThisMonth;
}

// Rembourser un token.
export async function refundToken(userId: number): Promise<void> {
  await prisma.user.updateMany({
    where: {
      id: userId,
      tokensUsedThisMonth: { gt: 0 },
    },
    data: {
      tokensUsedThisMonth: {
        decrement: 1,
      },
    },
  });
}
