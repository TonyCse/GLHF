import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Non autorise" }, { status: 403 });
    }

    const idFromParams = params?.id;
    const idFromPath = new URL(req.url).pathname.split("/").filter(Boolean).slice(-2, -1)[0];
    const tournamentId = Number(idFromParams ?? idFromPath);
    if (!Number.isFinite(tournamentId)) {
      return NextResponse.json({ error: "ID invalide" }, { status: 400 });
    }

    // Récupérer le tournoi actuel
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
    
    return NextResponse.redirect(
      new URL(`/admin/tournois?ok=${action}`, req.url)
    );
  } catch (error) {
    console.error("Erreur lors du basculement de suppression du tournoi:", error);
    return NextResponse.redirect(
      new URL("/admin/tournois?err=Erreur serveur", req.url)
    );
  }
}



