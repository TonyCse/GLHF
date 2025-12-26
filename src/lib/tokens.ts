// src/lib/tokens.ts
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

const DEFAULT_TOKENS_PER_MONTH = 3;

// Type "User avec son plan inclus"
export type UserWithPlan = Prisma.UserGetPayload<{
  include: { plan: true };
}>;

function getCurrentMonthStart(): Date {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  monthStart.setHours(0, 0, 0, 0);
  return monthStart;
}

export async function refreshUserTokensIfNeeded(
  userId: number
): Promise<UserWithPlan> {
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

export function getRemainingTokens(user: UserWithPlan | null) {
  if (!user) return 0;

  const tokensPerMonth = user.plan?.tokensPerMonth ?? DEFAULT_TOKENS_PER_MONTH;
  return tokensPerMonth - user.tokensUsedThisMonth;
}

export async function refundToken(userId: number): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: {
      tokensUsedThisMonth: {
        decrement: 1,
      },
    },
  });
}
