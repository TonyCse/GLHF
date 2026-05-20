import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

export async function GET() {
  try {
    const plans = await prisma.plan.findMany({
      orderBy: { priceCents: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        priceCents: true,
        currency: true,
        tokensPerMonth: true,
      },
    });

    return NextResponse.json(plans, {
      headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=300" },
    });
  } catch (err: unknown) {
    logger.error("plans_get_erreur", { message: err instanceof Error ? err.message : String(err) });
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
