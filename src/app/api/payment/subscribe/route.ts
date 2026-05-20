import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cancelPaypalSubscription, createPaypalSubscription } from "@/lib/paypal";
import { z } from "zod";
import { logger } from "@/lib/logger";

// Function qui permet de demarrer une souscription.
export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user?.email || !session.user.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const schema = z.object({
      planId: z.coerce.number().int().positive(),
    });
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "ID du plan requis" }, { status: 400 });
    }
    const { planId } = parsed.data;

    if (!planId) {
      return NextResponse.json({ error: "ID du plan requis" }, { status: 400 });
    }

    const plan = await prisma.plan.findUnique({
      where: { id: Number(planId) },
    });

    if (!plan) {
      return NextResponse.json({ error: "Plan introuvable" }, { status: 404 });
    }

    const userId = Number(session.user.id);
    if (!userId) {
      return NextResponse.json({ error: "Utilisateur invalide" }, { status: 400 });
    }

    const user = await prisma.user.findFirst({
      where: { id: userId, isDeleted: false },
      select: { paypalSubscriptionId: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
    }

    // Plan gratuit
    if (plan.priceCents === 0) {
      if (user.paypalSubscriptionId) {
        await cancelPaypalSubscription(user.paypalSubscriptionId, "User requested cancellation");
      }

      await prisma.user.update({
        where: { id: userId },
        data: {
          planId: plan.id,
          tokensUsedThisMonth: 0,
          tokensMonthStart: new Date(),
          paypalSubscriptionId: null,
        },
      });

      return NextResponse.json({
        success: true,
        redirectUrl: "/profil",
      });
    }

    if (!plan.paypalPlanId) {
      return NextResponse.json({ error: "Plan PayPal manquant" }, { status: 400 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (!appUrl) {
      return NextResponse.json({ error: "NEXT_PUBLIC_APP_URL manquant" }, { status: 500 });
    }

    const { approvalUrl } = await createPaypalSubscription({
      paypalPlanId: plan.paypalPlanId,
      returnUrl: `${appUrl}/abonnements/success`,
      cancelUrl: `${appUrl}/abonnements/cancel`,
      customId: String(userId),
    });

    return NextResponse.json({ success: true, approvalUrl });
  } catch (err: unknown) {
    logger.error("payment_subscribe_erreur", { message: err instanceof Error ? err.message : String(err) });
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
