import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim();

  if (!query || query.length < 2) {
    return NextResponse.json([]);
  }

  try {
    const users = await prisma.user.findMany({
      where: {
        isDeleted: false,
        OR: [
          { pseudo: { contains: query } },
          { email: { contains: query } },
        ],
      },
      select: {
        id: true,
        pseudo: true,
        email: true,
        avatarUrl: true,
        isDeleted: true,
        createdAt: true,
      },
      orderBy: [
        { pseudo: "asc" },
      ],
      take: 10, // Limiter les résultats
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("Erreur lors de la recherche d'utilisateurs:", error);
    return NextResponse.json(
      { error: "Erreur lors de la recherche" },
      { status: 500 }
    );
  }
}




