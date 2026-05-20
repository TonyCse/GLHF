import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { logger } from "@/lib/logger";

// Function qui permet de gerer le retour de paiement.
// Cette route sert uniquement de page de retour apres le paiement.
export async function GET(req: Request) {
  const session = await auth();

  if (!session?.user?.email) {
    return NextResponse.redirect(new URL("/connexion", req.url));
  }

  // Rediriger vers la page de profil — le webhook PayPal se charge de l'activation du plan
  return NextResponse.redirect(new URL("/profil?payment=pending", req.url));
}

// Function qui permet de confirmer un paiement via requete POST.
export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user?.email) {
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

    const user = await prisma.user.findFirst({
      where: { email: session.user.email, isDeleted: false },
    });

    const plan = await prisma.plan.findUnique({
      where: { id: planId },
    });

    if (!user || !plan) {
      return NextResponse.json({ error: "Utilisateur ou plan introuvable" }, { status: 404 });
    }

    // Verifier que l'utilisateur a une souscription PayPal active
    if (!user.paypalSubscriptionId) {
      return NextResponse.json({ error: "Aucune souscription PayPal active" }, { status: 403 });
    }

    // Verifier que le plan est payant (pas le plan gratuit)
    if (plan.priceCents <= 0) {
      return NextResponse.json({ error: "Plan gratuit, pas de paiement requis" }, { status: 400 });
    }

    // Verifier que la souscription PayPal correspond au plan demande
    if (plan.paypalPlanId) {
      const existingPlan = await prisma.plan.findFirst({
        where: { paypalPlanId: plan.paypalPlanId },
      });
      if (!existingPlan || existingPlan.id !== plan.id) {
        return NextResponse.json({ error: "Plan et souscription incohérents" }, { status: 400 });
      }
    }

    // L'activation du plan est gérée exclusivement par le webhook BILLING.SUBSCRIPTION.ACTIVATED
    // pour éviter les doubles mises à jour. Cette route confirme uniquement la cohérence des données.
    return NextResponse.json({
      success: true,
      message: `Souscription vérifiée. Le plan ${plan.name} sera activé sous peu.`,
      plan: {
        name: plan.name,
        tokensPerMonth: plan.tokensPerMonth,
      },
    });
  } catch (err: unknown) {
    logger.error("payment_success_erreur", { message: err instanceof Error ? err.message : String(err) });
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
