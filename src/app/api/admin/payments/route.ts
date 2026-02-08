import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const users = await prisma.user.findMany({
      include: { plan: true },
      orderBy: { id: "asc" },
    });

    const payments = users.map((u) => {
      const hasPlan = !!u.plan;
      return {
      id: u.id,
      userId: u.id,
      userName: u.pseudo ?? u.email ?? `user-${u.id}`,
      userEmail: u.email ?? null,
      subscriptionId: u.paypalSubscriptionId ?? null,
      tournamentId: null,
      tournamentName: null,
      amount: hasPlan ? Number((u.plan?.priceCents || 0) / 100) : 0,
      currency: u.plan?.currency ?? "EUR",
      status: hasPlan ? "active" : "inactive",
      paymentMethod: hasPlan ? "PayPal (via abonnement)" : "Aucun",
      transactionId: null,
      createdAt: u.updatedAt ?? u.createdAt ?? new Date(),
      completedAt: u.updatedAt ?? null,
      plan: hasPlan
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

    return NextResponse.json({ payments, debug: { count: payments.length } });
  } catch (err: any) {
    console.error("API /api/admin/payments error:", err);
    return new NextResponse(JSON.stringify({ error: err?.message ?? "unknown" }), { status: 500 });
  }
}
