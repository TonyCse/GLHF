import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const session = await auth();

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { id } = await params;
  const userId = parseInt(id, 10);

  if (!userId) {
    return NextResponse.json({ error: "ID utilisateur invalide" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const {
      pseudo,
      email,
      avatarUrl,
      role,
      tournamentsWon,
      matchesWon,
      ranking,
    } = body;

    // Validation basique
    if (!pseudo || !email) {
      return NextResponse.json({ error: "Pseudo et email sont requis" }, { status: 400 });
    }

    if (!["USER", "ADMIN"].includes(role)) {
      return NextResponse.json({ error: "Rôle invalide" }, { status: 400 });
    }

    // Vérifier que l'utilisateur existe
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
    }

    // Vérifier l'unicité du pseudo et de l'email (sauf pour l'utilisateur actuel)
    const pseudoConflict = await prisma.user.findFirst({
      where: {
        pseudo,
        id: { not: userId },
      },
    });

    if (pseudoConflict) {
      return NextResponse.json({ error: "Ce pseudo est déjà utilisé" }, { status: 400 });
    }

    const emailConflict = await prisma.user.findFirst({
      where: {
        email,
        id: { not: userId },
      },
    });

    if (emailConflict) {
      return NextResponse.json({ error: "Cet email est déjà utilisé" }, { status: 400 });
    }

    // Mettre à jour l'utilisateur
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        pseudo,
        email,
        avatarUrl: avatarUrl || "",
        role: role as Role,
        tournamentsWon: Math.max(0, parseInt(String(tournamentsWon)) || 0),
        matchesWon: Math.max(0, parseInt(String(matchesWon)) || 0),
        ranking: Math.max(0, parseInt(String(ranking)) || 0),
      },
      select: {
        id: true,
        pseudo: true,
        email: true,
        role: true,
      },
    });

    return NextResponse.json({
      message: "Utilisateur mis à jour avec succès",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'utilisateur:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}




