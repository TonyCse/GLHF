import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const { planId } = await req.json();

    if (!planId) {
      return NextResponse.json(
        { error: "ID du plan requis" },
        { status: 400 }
      );
    }

    // Vérifier que le plan existe
    const plan = await prisma.plan.findUnique({
      where: { id: parseInt(planId) },
    });

    if (!plan) {
      return NextResponse.json(
        { error: "Plan introuvable" },
        { status: 404 }
      );
    }

    // Pour le plan gratuit, pas besoin de PayPal
    if (plan.priceCents === 0) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
      });

      if (user) {
        await prisma.user.update({
          where: { id: user.id },
          data: { planId: plan.id },
        });

        return NextResponse.json({
          success: true,
          message: "Plan gratuit activé",
          redirectUrl: "/profil",
        });
      }
    }

    // Pour les plans payants, créer l'URL de paiement PayPal
    const paypalClientId = process.env.PAYPAL_CLIENT_ID;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    if (!paypalClientId) {
      return NextResponse.json(
        { error: "Configuration PayPal manquante" },
        { status: 500 }
      );
    }

    // Créer une URL de paiement simple (pour l'instant)
    // Dans un vrai projet, il faudrait utiliser l'API PayPal pour créer des abonnements
    const paypalUrl = `https://www.sandbox.paypal.com/cgi-bin/webscr?cmd=_xclick-subscriptions&business=${paypalClientId}&item_name=${encodeURIComponent(plan.name)}&a3=${plan.priceCents/100}&p3=1&t3=M&src=1&sra=1&return=${encodeURIComponent(baseUrl + '/api/payment/success')}&cancel_return=${encodeURIComponent(baseUrl + '/plan')}`;

    return NextResponse.json({
      success: true,
      paypalUrl,
      plan: {
        name: plan.name,
        price: plan.priceCents / 100,
        tokensPerMonth: plan.tokensPerMonth,
      },
    });

  } catch (error) {
    console.error("Erreur lors de la création de l'abonnement:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

