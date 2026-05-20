import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

function isAuthorizedCron(req: Request): boolean {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (!authHeader || !cronSecret) return false;
  return authHeader === `Bearer ${cronSecret}`;
}

// Function qui permet d'executer le reset mensuel via cron.
export async function GET(req: Request) {
  if (!isAuthorizedCron(req)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const currentDate = new Date();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    firstDayOfMonth.setHours(0, 0, 0, 0);

    // Reset les tokens pour tous les utilisateurs qui n'ont pas encore ete resetes ce mois-ci
    const result = await prisma.user.updateMany({
      where: {
        OR: [{ tokensMonthStart: null }, { tokensMonthStart: { lt: firstDayOfMonth } }],
      },
      data: {
        tokensUsedThisMonth: 0,
        tokensMonthStart: firstDayOfMonth,
      },
    });

    return NextResponse.json({
      success: true,
      message: `${result.count} utilisateurs mis à jour`,
      resetDate: firstDayOfMonth.toISOString(),
    });
  } catch (err: unknown) {
    logger.error("cron_reset_tokens_erreur", { message: err instanceof Error ? err.message : String(err) });
    return NextResponse.json({ error: "Erreur lors du reset mensuel" }, { status: 500 });
  }
}

// Function qui permet un reset manuel (admin uniquement).
export async function POST(req: Request) {
  if (!isAuthorizedCron(req)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const currentDate = new Date();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    firstDayOfMonth.setHours(0, 0, 0, 0);

    const result = await prisma.user.updateMany({
      data: {
        tokensUsedThisMonth: 0,
        tokensMonthStart: firstDayOfMonth,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Reset forcé: ${result.count} utilisateurs mis à jour`,
      resetDate: firstDayOfMonth.toISOString(),
    });
  } catch (err: unknown) {
    logger.error("cron_reset_force_erreur", { message: err instanceof Error ? err.message : String(err) });
    return NextResponse.json({ error: "Erreur lors du reset forcé" }, { status: 500 });
  }
}
