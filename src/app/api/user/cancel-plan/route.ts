import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cancelPaypalSubscription } from "@/lib/paypal";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  try {
    const userId = Number(session.user.id);
    if (!userId) {
      return NextResponse.json({ error: "Utilisateur invalide" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { paypalSubscriptionId: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
    }

    if (user.paypalSubscriptionId) {
      await cancelPaypalSubscription(
        user.paypalSubscriptionId,
        "User requested cancellation"
      );
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
  } catch (e) {
    console.error("Erreur cancel plan:", e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
