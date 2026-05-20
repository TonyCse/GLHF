import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Function qui permet de rechercher des utilisateurs.
export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
    return NextResponse.json({ error: "Accès interdit" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const schema = z.object({
    q: z.string().min(2).max(100),
  });
  const parsed = schema.safeParse({ q: searchParams.get("q")?.trim() });
  if (!parsed.success) {
    return NextResponse.json([]);
  }
  const query = parsed.data.q;

  try {
    const users = await prisma.user.findMany({
      where: {
        isDeleted: false,
        OR: [{ pseudo: { contains: query } }, { email: { contains: query } }],
      },
      select: {
        id: true,
        pseudo: true,
        email: true,
        avatarUrl: true,
        isDeleted: true,
        createdAt: true,
      },
      orderBy: [{ pseudo: "asc" }],
      take: 10, 
    });

    return NextResponse.json(users);
  } catch {
    return NextResponse.json({ error: "Erreur lors de la recherche" }, { status: 500 });
  }
}
