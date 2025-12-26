import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { userId, action } = body as { userId?: number; action?: string };
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
          tokensUsedThisMonth: 0,
          tokensMonthStart: null,
        },
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err: any) {
    console.error("/api/admin/payments/action error:", err);
    return NextResponse.json({ error: err?.message ?? "Server error" }, { status: 500 });
  }
}
