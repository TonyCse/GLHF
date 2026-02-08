// src/app/api/paypal/create-subscription/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { createPaypalSubscription } from "@/lib/paypal";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.redirect("/signin");
  }

  const contentType = req.headers.get("content-type") || "";
  let planIdValue: unknown = null;

  if (contentType.includes("application/json")) {
    const body = await req.json().catch(() => ({}));
    planIdValue = body?.planId;
  } else {
    const form = await req.formData();
    planIdValue = form.get("planId");
  }

  const planId = Number(planIdValue);
  if (!planId) {
    return NextResponse.json({ error: "ID du plan requis" }, { status: 400 });
  }

  const plan = await prisma.plan.findUnique({ where: { id: planId } });
  if (!plan) {
    return NextResponse.json({ error: "Plan introuvable" }, { status: 404 });
  }

  if (plan.priceCents === 0) {
    return NextResponse.json(
      { error: "Plan gratuit non compatible PayPal" },
      { status: 400 }
    );
  }

  if (!plan.paypalPlanId) {
    return NextResponse.json({ error: "Plan PayPal manquant" }, { status: 400 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!appUrl) {
    return NextResponse.json(
      { error: "NEXT_PUBLIC_APP_URL manquant" },
      { status: 500 }
    );
  }

  try {
    const { approvalUrl } = await createPaypalSubscription({
      paypalPlanId: plan.paypalPlanId,
      returnUrl: `${appUrl}/abonnements/success`,
      cancelUrl: `${appUrl}/abonnements/cancel`,
      customId: String(session.user.id),
    });

    return NextResponse.redirect(approvalUrl);
  } catch (e: any) {
    console.error(e);
    return NextResponse.json(
      { error: e.message ?? "Erreur PayPal" },
      { status: 500 }
    );
  }
}
