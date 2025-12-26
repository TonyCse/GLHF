import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const usersWithPlans = await prisma.user.findMany({
      where: { planId: { not: null } },
      include: { plan: true },
      orderBy: { id: "asc" },
    });

    console.log("[api/admin/payments] usersWithPlans count:", usersWithPlans.length);
    if (usersWithPlans.length > 0) console.log("[api/admin/payments] sample:", JSON.stringify(usersWithPlans[0]));

    const payments = usersWithPlans.map((u) => ({
      id: u.id,
      userId: u.id,
      userName: u.pseudo ?? u.email ?? `user-${u.id}`,
      userEmail: u.email ?? null,
      tournamentId: null,
      tournamentName: null,
      amount: u.plan ? Number((u.plan.priceCents || 0) / 100) : 0,
      currency: u.plan?.currency ?? "EUR",
      status: "active",
      paymentMethod: "PayPal (via abonnement)",
      transactionId: null,
      createdAt: u.updatedAt ?? u.createdAt ?? new Date(),
      completedAt: u.updatedAt ?? null,
      plan: u.plan
        ? {
            id: u.plan.id,
            name: u.plan.name,
            slug: u.plan.slug,
            priceCents: u.plan.priceCents,
          }
        : null,
    }));

    return NextResponse.json({ payments, debug: { count: usersWithPlans.length } });
  } catch (err: any) {
    console.error("API /api/admin/payments error:", err);
    return new NextResponse(JSON.stringify({ error: err?.message ?? "unknown" }), { status: 500 });
  }
}
