import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Function qui permet de basculer le soft-delete d'un tournoi.
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();

    if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const { id: idFromParams } = await params;
    const idFromPath = new URL(req.url).pathname.split("/").filter(Boolean).slice(-2, -1)[0];
    const idSchema = z.coerce.number().int().positive();
    const parsedId = idSchema.safeParse(idFromParams ?? idFromPath);
    if (!parsedId.success) {
      return NextResponse.json({ error: "ID invalide" }, { status: 400 });
    }
    const tournamentId = parsedId.data;

    // Recuperer le tournoi actuel
    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
      select: { isDeleted: true },
    });

    if (!tournament) {
      return NextResponse.json({ error: "Tournoi non trouvé" }, { status: 404 });
    }

    // Basculer le statut isDeleted
    await prisma.tournament.update({
      where: { id: tournamentId },
      data: { isDeleted: !tournament.isDeleted },
    });

    const action = tournament.isDeleted ? "tournament_restored" : "tournament_deleted";

    return NextResponse.redirect(new URL(`/admin/tournois?ok=${action}`, req.url));
  } catch {
    return NextResponse.redirect(new URL("/admin/tournois?err=Erreur serveur", req.url));
  }
}
