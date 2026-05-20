import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cancelPaypalSubscription } from "@/lib/paypal";
import { z } from "zod";
import { logger } from "@/lib/logger";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  try {
    const idSchema = z.coerce.number().int().positive();
    const parsedId = idSchema.safeParse(session.user.id);
    if (!parsedId.success) {
      return NextResponse.json({ error: "Utilisateur invalide" }, { status: 400 });
    }
    const userId = parsedId.data;

    const user = await prisma.user.findFirst({
      where: { id: userId, isDeleted: false },
      select: { paypalSubscriptionId: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
    }

    if (user.paypalSubscriptionId) {
      await cancelPaypalSubscription(user.paypalSubscriptionId, "User requested cancellation");
    }

    const freePlan = await prisma.plan.findFirst({
      where: { priceCents: 0 },
    });

    await prisma.user.update({
      where: { id: userId },
      data: {
        planId: freePlan?.id ?? null,
        tokensUsedThisMonth: 0,
        tokensMonthStart: freePlan ? new Date() : null,
        paypalSubscriptionId: null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    logger.error("user_cancel_plan_erreur", { message: err instanceof Error ? err.message : String(err) });
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
