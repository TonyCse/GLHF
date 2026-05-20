import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { logger } from "@/lib/logger";

export async function POST(req: Request) {
  const session = await auth();
  if (!session || session.user?.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Accès interdit" }, { status: 403 });
  }

  try {
    let payload: unknown = null;
    try {
      payload = await req.json();
    } catch {
      return NextResponse.json({ error: "Payload invalide" }, { status: 400 });
    }

    const schema = z.discriminatedUnion("action", [
      z.object({
        action: z.literal("cancel"),
        userId: z.coerce.number().int().positive(),
      }),
      z.object({
        action: z.literal("change_plan"),
        userId: z.coerce.number().int().positive(),
        planId: z.coerce.number().int().positive(),
      }),
    ]);

    const parsed = schema.safeParse(payload);
    if (!parsed.success) {
      return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });
    }

    const { userId, action } = parsed.data;
    const planId = "planId" in parsed.data ? parsed.data.planId : undefined;

    if (action === "cancel") {
      const user = await prisma.user.findFirst({ where: { id: Number(userId), isDeleted: false } });
      if (!user) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });

      await prisma.user.update({
        where: { id: Number(userId) },
        data: {
          planId: null,
          paypalSubscriptionId: null,
          tokensUsedThisMonth: 0,
          tokensMonthStart: null,
        },
      });

      return NextResponse.json({ success: true });
    }

    if (action === "change_plan") {
      if (!planId) {
        return NextResponse.json({ error: "ID du plan manquant" }, { status: 400 });
      }

      const plan = await prisma.plan.findUnique({ where: { id: Number(planId) } });
      if (!plan) {
        return NextResponse.json({ error: "Plan introuvable" }, { status: 404 });
      }

      const user = await prisma.user.findFirst({ where: { id: Number(userId), isDeleted: false } });
      if (!user) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });

      await prisma.user.update({
        where: { id: Number(userId) },
        data: {
          planId: plan.id,
          tokensUsedThisMonth: 0,
          tokensMonthStart: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        plan: {
          id: plan.id,
          name: plan.name,
          slug: plan.slug,
          priceCents: plan.priceCents,
          currency: plan.currency,
          tokensPerMonth: plan.tokensPerMonth,
        },
      });
    }

    return NextResponse.json({ error: "Action inconnue" }, { status: 400 });
  } catch (err: unknown) {
    logger.error("admin_payments_action_erreur", { message: err instanceof Error ? err.message : String(err) });
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
