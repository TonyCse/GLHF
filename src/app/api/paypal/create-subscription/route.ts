// src/app/api/paypal/create-subscription/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const PAYPAL_BASE_URL = process.env.PAYPAL_BASE_URL;
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_SECRET = process.env.PAYPAL_SECRET;

function validatePayPalConfig() {
  if (!PAYPAL_BASE_URL || !PAYPAL_CLIENT_ID || !PAYPAL_SECRET) {
    throw new Error(
      `Variables d'environnement PayPal manquantes. Vérifiez: PAYPAL_BASE_URL=${PAYPAL_BASE_URL ? '✓' : '✗'}, PAYPAL_CLIENT_ID=${PAYPAL_CLIENT_ID ? '✓' : '✗'}, PAYPAL_SECRET=${PAYPAL_SECRET ? '✓' : '✗'}`
    );
  }
}

async function getAccessToken() {
  validatePayPalConfig();

  const auth = Buffer.from(
    `${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`
  ).toString("base64");

  console.log("[PayPal] Tentative de token avec BASE_URL:", PAYPAL_BASE_URL);
  
  const res = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error("[PayPal] Erreur token HTTP", res.status, errText);
    throw new Error(`Erreur PayPal (token): ${res.status} - ${errText}`);
  }
  
  const data = await res.json();
  return data.access_token as string;
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.redirect("/signin");
  }

  const form = await req.formData();
  const planId = Number(form.get("planId"));

  const plan = await prisma.plan.findUnique({ where: { id: planId } });
  if (!plan) {
    return NextResponse.json({ error: "Plan introuvable" }, { status: 404 });
  }

  try {
    const accessToken = await getAccessToken();

    // création d'une "order" PayPal
    const orderRes = await fetch(
      `${PAYPAL_BASE_URL}/v2/checkout/orders`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          intent: "CAPTURE",
          purchase_units: [
            {
              amount: {
                currency_code: plan.currency,
                value: (plan.priceCents / 100).toFixed(2),
              },
              description: `Forfait ${plan.name} - GLHF`,
            },
          ],
          application_context: {
            brand_name: "GLHF",
            landing_page: "LOGIN",
            user_action: "PAY_NOW",
            return_url: `${process.env.NEXT_PUBLIC_APP_URL}/abonnements/success?planId=${plan.id}`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/abonnements/cancel`,
          },
        }),
      }
    );

    if (!orderRes.ok) {
      const txt = await orderRes.text();
      console.error("PayPal order error:", txt);
      throw new Error("Erreur PayPal (order)");
    }

    const orderData = await orderRes.json();

    const approveLink = orderData.links.find(
      (l: any) => l.rel === "approve"
    )?.href;

    if (!approveLink) {
      throw new Error("Lien d'approbation PayPal introuvable");
    }

    // redirection vers PayPal
    return NextResponse.redirect(approveLink);
  } catch (e: any) {
    console.error(e);
    return NextResponse.json(
      { error: e.message ?? "Erreur PayPal" },
      { status: 500 }
    );
  }
}
