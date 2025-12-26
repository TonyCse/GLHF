import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const tournamentId = parseInt(params.id, 10);
  if (isNaN(tournamentId)) {
    return NextResponse.json({ error: "ID invalide" }, { status: 400 });
  }

  try {
    const { winnerId } = await req.json();

    const updated = await prisma.tournament.update({
      where: { id: tournamentId },
      data: { winnerId: winnerId ?? null },
    });

    return NextResponse.json({ success: true, tournament: updated });
  } catch (err) {
    console.error("Erreur mise à jour winner:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
