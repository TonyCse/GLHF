import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  try {
    await prisma.user.update({
      where: { id: Number(session.user.id) },
      data: {
        planId: null,
        tokensUsedThisMonth: 0,
        tokensMonthStart: null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Erreur cancel plan:", e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
