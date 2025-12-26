import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const users = await prisma.user.findMany({
    where: {
      isDeleted: false, // Exclure les utilisateurs supprimés
    },
    orderBy: {
      ranking: "desc",
    },
    select: {
      id: true,
      pseudo: true,
      avatarUrl: true,
      ranking: true,
    },
  });

  return NextResponse.json(users);
}
