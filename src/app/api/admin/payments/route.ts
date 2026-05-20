import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { logger } from "@/lib/logger";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Accès interdit" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const schema = z.object({
      limit: z.coerce.number().int().min(1).max(200).optional(),
    });
    const parsed = schema.safeParse({ limit: searchParams.get("limit") ?? undefined });
    if (!parsed.success) {
      return NextResponse.json({ error: "Parametres invalides" }, { status: 400 });
    }

    const users = await prisma.user.findMany({
      where: { isDeleted: false },
      include: { plan: true },
      orderBy: { id: "asc" },
      take: parsed.data.limit,
    });

    const payments = users.map((u) => {
      const hasPaidPlan = !!u.plan && Number(u.plan.priceCents || 0) > 0;
      return {
        id: u.id,
        userId: u.id,
        userName: u.pseudo ?? u.email ?? `user-${u.id}`,
        userEmail: u.email ?? null,
        subscriptionId: u.paypalSubscriptionId ?? null,
        tournamentId: null,
        tournamentName: null,
        amount: hasPaidPlan ? Number((u.plan?.priceCents || 0) / 100) : 0,
        currency: u.plan?.currency ?? "EUR",
        status: hasPaidPlan ? "active" : "inactive",
        paymentMethod: hasPaidPlan ? "PayPal (via abonnement)" : "Aucun",
        transactionId: null,
        createdAt: u.createdAt ?? new Date(),
        completedAt: null,
        plan: u.plan
          ? {
              id: u.plan!.id,
              name: u.plan!.name,
              slug: u.plan!.slug,
              priceCents: u.plan!.priceCents,
              currency: u.plan!.currency,
              tokensPerMonth: u.plan!.tokensPerMonth,
            }
          : null,
      };
    });

    return NextResponse.json({ payments });
  } catch (err: unknown) {
    logger.error("admin_payments_get_erreur", { message: err instanceof Error ? err.message : String(err) });
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
