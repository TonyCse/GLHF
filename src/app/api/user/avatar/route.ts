import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { logger } from "@/lib/logger";

export async function PATCH() {
  const session = await auth();
  if (!session || !session.user?.email) {
    return NextResponse.json({ success: false, message: "Non autorisé" }, { status: 401 });
  }

  const email = session.user.email;

  try {
    const user = await prisma.user.findFirst({
      where: { email, isDeleted: false },
    });
    if (!user) {
      return NextResponse.json({ success: false, message: "Utilisateur introuvable" }, { status: 404 });
    }

    const newSeed = crypto.randomUUID();
    const newAvatarUrl = `https://api.dicebear.com/9.x/lorelei/png?seed=${newSeed}`;

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { avatarUrl: newAvatarUrl },
    });

    return NextResponse.json({ success: true, avatarUrl: updatedUser.avatarUrl });
  } catch (err: unknown) {
    logger.error("user_avatar_erreur", { message: err instanceof Error ? err.message : String(err) });
    return NextResponse.json({ success: false, message: "Erreur serveur" }, { status: 500 });
  }
}
