import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPaypalWebhookSignature } from "@/lib/paypal";
import { z } from "zod";
import { logger } from "@/lib/logger";

type PaypalResource = {
  id?: string;
  custom_id?: string;
  plan_id?: string;
  amount?: { total?: string };
};

type PaypalWebhookPayload = {
  event_type: string;
  resource?: PaypalResource;
};

// Function qui permet de traiter le webhook PayPal.
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const isVerified = await verifyPaypalWebhookSignature(body, req.headers);
    if (!isVerified) {
      return NextResponse.json({ error: "Webhook non authentifie" }, { status: 401 });
    }

    const schema = z
      .object({
        event_type: z.string(),
        resource: z.unknown().optional(),
      })
      .passthrough();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Payload invalide" }, { status: 400 });
    }

    const eventType = parsed.data.event_type;

    // Log event type only (no sensitive data)

    switch (eventType) {
      case "BILLING.SUBSCRIPTION.CREATED":
        await handleSubscriptionCreated(parsed.data as PaypalWebhookPayload);
        break;

      case "BILLING.SUBSCRIPTION.ACTIVATED":
        await handleSubscriptionActivated(parsed.data as PaypalWebhookPayload);
        break;

      case "BILLING.SUBSCRIPTION.CANCELLED":
        await handleSubscriptionCancelled(parsed.data as PaypalWebhookPayload);
        break;

      case "BILLING.SUBSCRIPTION.SUSPENDED":
        await handleSubscriptionSuspended(parsed.data as PaypalWebhookPayload);
        break;

      case "PAYMENT.SALE.COMPLETED":
        await handlePaymentCompleted(parsed.data as PaypalWebhookPayload);
        break;

      default:
        // Type d'événement PayPal non géré
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    logger.error("webhook_paypal_erreur", { message: err instanceof Error ? err.message : String(err) });
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// Function qui permet de traiter la creation d'abonnement.
async function handleSubscriptionCreated(data: PaypalWebhookPayload) {
  const subscriptionId = data.resource?.id;
  const customId = data.resource?.custom_id;

  logger.info("paypal_souscription_creee", { subscriptionId, customId });

  if (!subscriptionId) return;

  const user = await prisma.user.findFirst({
    where: { paypalSubscriptionId: subscriptionId },
    select: { id: true },
  });

  if (!user) {
    logger.warn("paypal_souscription_creee_sans_utilisateur", { subscriptionId, customId });
  }
}

// Function qui permet de traiter l'activation d'un abonnement.
async function handleSubscriptionActivated(data: PaypalWebhookPayload) {
  const subscriptionId = data.resource?.id;
  const customId = data.resource?.custom_id;
  const planId = data.resource?.plan_id;

  let userId: number | null = null;
  if (customId) {
    const parsed = parseInt(customId);
    if (!Number.isNaN(parsed) && parsed > 0) userId = parsed;
  }

  if (!userId && subscriptionId) {
    const user = await prisma.user.findFirst({
      where: { paypalSubscriptionId: subscriptionId },
      select: { id: true },
    });
    userId = user?.id ?? null;
  }

  if (!userId || !planId) {
    return;
  }

  const plan = await prisma.plan.findFirst({
    where: { paypalPlanId: planId },
  });

  if (!plan) return;

  await prisma.user.update({
    where: { id: userId },
    data: {
      planId: plan.id,
      tokensUsedThisMonth: 0,
      tokensMonthStart: new Date(),
      paypalSubscriptionId: subscriptionId,
    },
  });
}

// Function qui permet de traiter l'annulation d'un abonnement.
async function handleSubscriptionCancelled(data: PaypalWebhookPayload) {
  const subscriptionId = data.resource?.id;
  const customId = data.resource?.custom_id;

  let userId: number | null = null;
  if (customId) {
    const parsed = parseInt(customId);
    if (!Number.isNaN(parsed) && parsed > 0) userId = parsed;
  }

  if (!userId && subscriptionId) {
    const user = await prisma.user.findFirst({
      where: { paypalSubscriptionId: subscriptionId },
      select: { id: true },
    });
    userId = user?.id ?? null;
  }

  if (!userId) {
    return;
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

  // Utilisateur remis sur le plan gratuit
}

// Function qui permet de traiter la suspension d'un abonnement.
async function handleSubscriptionSuspended(data: PaypalWebhookPayload) {
  const subscriptionId = data.resource?.id;
  const customId = data.resource?.custom_id;

  let userId: number | null = null;
  if (customId) {
    const parsed = parseInt(customId);
    if (!Number.isNaN(parsed) && parsed > 0) userId = parsed;
  }

  if (!userId && subscriptionId) {
    const user = await prisma.user.findFirst({
      where: { paypalSubscriptionId: subscriptionId },
      select: { id: true },
    });
    userId = user?.id ?? null;
  }

  logger.warn("paypal_souscription_suspendue", { subscriptionId, userId });
}

// Function qui permet de traiter un paiement reussi.
async function handlePaymentCompleted(data: PaypalWebhookPayload) {
  logger.info("paypal_paiement_recu", {
    resourceId: data.resource?.id,
    montant: data.resource?.amount?.total,
  });
}
