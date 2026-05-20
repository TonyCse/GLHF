import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Function qui permet de supprimer un tournoi et ses donnees.
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { id: idFromParams } = await params;
  const id = parseInt(idFromParams, 10);
  if (isNaN(id)) {
    return NextResponse.json({ error: "ID invalide" }, { status: 400 });
  }

  try {
    const tournoi = await prisma.tournament.findUnique({
      where: { id, isDeleted: false },
      include: { createdBy: true },
    });

    if (!tournoi) {
      return NextResponse.json({ error: "Tournoi introuvable" }, { status: 404 });
    }

    if (tournoi.createdBy.isDeleted || tournoi.createdBy.email !== session.user.email) {
      return NextResponse.json({ error: "Accès interdit" }, { status: 403 });
    }

    // Soft delete du tournoi
    await prisma.tournament.update({
      where: { id },
      data: { isDeleted: true },
    });

    return NextResponse.redirect(new URL("/tournois", _req.url));
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
