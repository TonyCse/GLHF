import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const id = parseInt(params.id, 10);
  if (isNaN(id)) {
    return NextResponse.json({ error: "ID invalide" }, { status: 400 });
  }

  try {
    const tournoi = await prisma.tournament.findUnique({
      where: { id },
      include: { createdBy: true },
    });

    if (!tournoi || tournoi.createdBy.email !== session.user.email) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    // 1. Supprimer tous les gagnants des matchs
    await prisma.match.updateMany({
      where: { tournamentId: id },
      data: { winnerId: null },
    });

    // 2. Supprimer tous les matchs liés
    await prisma.match.deleteMany({
      where: { tournamentId: id },
    });

    // 3. Détacher tous les participants
    await prisma.tournament.update({
      where: { id },
      data: { participants: { set: [] } },
    });

    // 4. Supprimer le tournoi
    await prisma.tournament.delete({
      where: { id },
    });

    return NextResponse.redirect(new URL("/tournois", _req.url));
  } catch (error) {
    console.error("Erreur DELETE tournoi :", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
