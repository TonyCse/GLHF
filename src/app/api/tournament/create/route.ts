import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Game } from "@prisma/client";
import { writeFile } from "fs/promises";
import path from "path";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const formData = await req.formData();

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const maxPlayers = parseInt(formData.get("maxPlayers") as string, 10);
  const date = formData.get("date") as string;
  const time = formData.get("time") as string;
  const game = formData.get("game") as string;
  const image = formData.get("image") as File | null;

  if (!name || !description || !maxPlayers || !date || !time || !game) {
    return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 });
  }

  const tournamentDate = new Date(`${date}T${time}`);


  if (image) {
    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const fileName = `${Date.now()}-${image.name}`;
    const filePath = path.join(process.cwd(), "public/uploads", fileName);

    await writeFile(filePath, buffer);
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    const createdTournament = await prisma.tournament.create({
      data: {
        name,
        description,
        maxPlayers,
        date: tournamentDate,
        game: game as Game,
        createdBy: user ? { connect: { id: user.id } } : undefined,
      },
    });

    return NextResponse.json(createdTournament, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la création du tournoi :", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
