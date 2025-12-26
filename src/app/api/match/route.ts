import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, game, result, date } = body;

    if (!email || !game || !result || !date) {
      return NextResponse.json({ error: "Champs manquants" }, { status: 400 });
    }

    return NextResponse.json({
      error: "Fonctionnalité désactivée : le modèle Match ne contient pas de champ 'result' ou 'game'.",
    }, { status: 400 });

  } catch (error) {
    console.error("Erreur API /api/match :", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
