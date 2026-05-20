// Route qui retourne la liste des tournois.
import { NextResponse } from "next/server";
import { getTournamentList } from "@/lib/tournaments";
import { Game } from "@prisma/client";
import { z } from "zod";

// Function qui permet de recuperer la liste des tournois.
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const schema = z.object({
      limit: z.coerce.number().int().min(1).max(100).optional(),
      game: z.nativeEnum(Game).optional(),
    });
    const parsed = schema.safeParse({
      limit: searchParams.get("limit") ?? undefined,
      game: searchParams.get("game") ?? undefined,
    });
    if (!parsed.success) {
      return NextResponse.json({ error: "Parametres invalides" }, { status: 400 });
    }

    const tournois = await getTournamentList({ game: parsed.data.game });
    const limited = parsed.data.limit ? tournois.slice(0, parsed.data.limit) : tournois;

    return NextResponse.json(limited);
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
