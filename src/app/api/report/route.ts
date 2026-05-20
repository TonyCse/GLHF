import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { z } from "zod";

const postSchema = z.object({
  participantId: z.coerce.number().int().positive(),
  motif: z.string().min(1),
  details: z.string().optional(),
  tournoiId: z.coerce.number().int().positive(),
  reporterId: z.coerce.number().int().positive(),
});

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Payload invalide" }, { status: 400 });
  }

  const parsed = postSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 });
  }

  const { participantId, motif, details, tournoiId, reporterId } = parsed.data;

  try {
    await prisma.report.create({
      data: { participantId, motif, details, tournoiId, reporterId },
    });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    logger.error("report_post_erreur", { message: err instanceof Error ? err.message : String(err) });
    return NextResponse.json({ error: "Erreur lors de l'enregistrement" }, { status: 500 });
  }
}

/**
 * GET /api/report — deux modes selon les query params :
 *   ?reporterId=X&tournoiId=Y  → mode UI : liste des participantId déjà signalés par cet utilisateur
 *                                 dans ce tournoi. Réponse légère : { reports: [{ participantId }] }
 *   (sans params)              → mode admin : tous les signalements avec relations hydratées.
 *                                 Réponse complète : { reports: [{ id, motif, participant, ... }] }
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const hasFilterParams = searchParams.has("reporterId") && searchParams.has("tournoiId");

  if (hasFilterParams) {
    const filterSchema = z.object({
      reporterId: z.coerce.number().int().positive(),
      tournoiId: z.coerce.number().int().positive(),
    });
    const parsed = filterSchema.safeParse({
      reporterId: searchParams.get("reporterId"),
      tournoiId: searchParams.get("tournoiId"),
    });
    if (!parsed.success) {
      return NextResponse.json({ error: "Paramètres invalides" }, { status: 400 });
    }

    try {
      const reports = await prisma.report.findMany({
        where: { reporterId: parsed.data.reporterId, tournoiId: parsed.data.tournoiId },
        select: { participantId: true },
      });
      return NextResponse.json({ reports });
    } catch (err: unknown) {
      logger.error("report_get_erreur", { message: err instanceof Error ? err.message : String(err) });
      return NextResponse.json({ error: "Erreur lors de la récupération" }, { status: 500 });
    }
  }

  try {
    // Mode admin : on hydrate manuellement les relations pour tolérer des données orphelines.
    const reports = await prisma.report.findMany({
      orderBy: { date: "desc" },
      select: {
        id: true,
        participantId: true,
        motif: true,
        details: true,
        tournoiId: true,
        reporterId: true,
        date: true,
      },
    });

    const participantIds = [...new Set(reports.map((report) => report.participantId))];
    const reporterIds = [...new Set(reports.map((report) => report.reporterId))];
    const tournamentIds = [...new Set(reports.map((report) => report.tournoiId))];

    const [participants, reporters, tournaments] = await Promise.all([
      prisma.user.findMany({
        where: { id: { in: participantIds } },
        select: { id: true, pseudo: true },
      }),
      prisma.user.findMany({
        where: { id: { in: reporterIds } },
        select: { id: true, pseudo: true },
      }),
      prisma.tournament.findMany({
        where: { id: { in: tournamentIds } },
        select: { id: true, name: true },
      }),
    ]);

    const participantsById = new Map(
      participants.map((participant) => [participant.id, participant]),
    );
    const reportersById = new Map(reporters.map((reporter) => [reporter.id, reporter]));
    const tournamentsById = new Map(
      tournaments.map((tournament) => [tournament.id, tournament]),
    );

    const hydratedReports = reports.map((report) => ({
      ...report,
      participant: participantsById.get(report.participantId) ?? null,
      reporter: reportersById.get(report.reporterId) ?? null,
      tournament: tournamentsById.get(report.tournoiId) ?? null,
    }));

    return NextResponse.json({ reports: hydratedReports });
  } catch (err: unknown) {
    logger.error("report_get_admin_erreur", { message: err instanceof Error ? err.message : String(err) });
    return NextResponse.json({ error: "Erreur lors de la récupération" }, { status: 500 });
  }
}
