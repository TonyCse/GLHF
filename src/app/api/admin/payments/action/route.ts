import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();
  if (!session || session.user?.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { userId, action, planId } = body as { userId?: number; action?: string; planId?: number };
    if (!userId || !action) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    if (action === "cancel") {
      const user = await prisma.user.findUnique({ where: { id: Number(userId) } });
      if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

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
        return NextResponse.json({ error: "Missing planId" }, { status: 400 });
      }

      const plan = await prisma.plan.findUnique({ where: { id: Number(planId) } });
      if (!plan) {
        return NextResponse.json({ error: "Plan not found" }, { status: 404 });
      }

      const user = await prisma.user.findUnique({ where: { id: Number(userId) } });
      if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

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

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err: any) {
    console.error("/api/admin/payments/action error:", err);
    return NextResponse.json({ error: err?.message ?? "Server error" }, { status: 500 });
  }
}
