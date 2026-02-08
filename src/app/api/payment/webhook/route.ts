import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    // Vérifier l'authentification du webhook PayPal
    // En production, il faut vérifier la signature PayPal
    const paypalSignature = req.headers.get('paypal-auth-algo');
    const paypalCertId = req.headers.get('paypal-cert-id');
    
    if (!paypalSignature || !paypalCertId) {
      return NextResponse.json(
        { error: "Webhook non authentifié" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const eventType = body.event_type;

    console.log("PayPal webhook reçu:", eventType);

    switch (eventType) {
      case 'BILLING.SUBSCRIPTION.CREATED':
        await handleSubscriptionCreated(body);
        break;
        
      case 'BILLING.SUBSCRIPTION.ACTIVATED':
        await handleSubscriptionActivated(body);
        break;
        
      case 'BILLING.SUBSCRIPTION.CANCELLED':
        await handleSubscriptionCancelled(body);
        break;
        
      case 'BILLING.SUBSCRIPTION.SUSPENDED':
        await handleSubscriptionSuspended(body);
        break;
        
      case 'PAYMENT.SALE.COMPLETED':
        await handlePaymentCompleted(body);
        break;
        
      default:
        console.log("Type d'événement PayPal non géré:", eventType);
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Erreur lors du traitement du webhook PayPal:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

async function handleSubscriptionCreated(data: any) {
  // L'abonnement a été créé mais pas encore activé
  console.log("Abonnement PayPal créé:", data.resource.id);
}

async function handleSubscriptionActivated(data: any) {
  // L'abonnement a été activé, activer le plan utilisateur
  const subscriptionId = data.resource.id;
  const customId = data.resource.custom_id; // ID utilisateur que nous aurons passé
  const planId = data.resource.plan_id;

  let userId: number | null = null;
  if (customId) {
    const parsed = parseInt(customId);
    if (!Number.isNaN(parsed)) userId = parsed;
  }

  if (!userId && subscriptionId) {
    const user = await prisma.user.findFirst({
      where: { paypalSubscriptionId: subscriptionId },
      select: { id: true },
    });
    userId = user?.id ?? null;
  }

  if (!userId || !planId) return;

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

async function handleSubscriptionCancelled(data: any) {
  // L'abonnement a été annulé, remettre l'utilisateur sur le plan gratuit
  const subscriptionId = data.resource.id;
  const customId = data.resource.custom_id;
  
  let userId: number | null = null;
  if (customId) {
    const parsed = parseInt(customId);
    if (!Number.isNaN(parsed)) userId = parsed;
  }

  if (!userId && subscriptionId) {
    const user = await prisma.user.findFirst({
      where: { paypalSubscriptionId: subscriptionId },
      select: { id: true },
    });
    userId = user?.id ?? null;
  }

  if (!userId) return;

  // Trouver le plan gratuit
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

  console.log("Utilisateur remis sur le plan gratuit:", userId);
}

async function handleSubscriptionSuspended(data: any) {
  // L'abonnement a été suspendu (paiement échoué, etc.)
  console.log("Abonnement suspendu:", data.resource.id);
  
  // Ici, on pourrait envoyer un email à l'utilisateur ou suspendre temporairement l'accès premium
}

async function handlePaymentCompleted(data: any) {
  // Un paiement récurrent a été effectué avec succès
  const paymentAmount = data.resource.amount.total;
  console.log("Paiement PayPal reçu:", paymentAmount);
}


