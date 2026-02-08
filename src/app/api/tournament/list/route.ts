// /src/app/api/tournament/list/route.ts
import { NextResponse } from "next/server";
import { getTournamentList } from "@/lib/tournaments";

export async function GET() {
  try {
    const tournois = await getTournamentList();

    console.log("Tournois renvoyǸs :", JSON.stringify(tournois, null, 2));

    return NextResponse.json(tournois);
  } catch (error) {
    console.error("Erreur lors de la rǸcupǸration des tournois:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
