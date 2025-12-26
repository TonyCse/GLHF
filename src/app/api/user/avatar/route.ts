import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest) {
  const { email } = await req.json();

  if (!email) {
    return NextResponse.json({ success: false, message: "Email requis" }, { status: 400 });
  }

  const newSeed = crypto.randomUUID();
  const newAvatarUrl = `https://api.dicebear.com/9.x/lorelei/png?seed=${newSeed}`;

  try {
    const updatedUser = await prisma.user.update({
      where: { email },
      data: { avatarUrl: newAvatarUrl },
    });

    return NextResponse.json({ success: true, avatarUrl: updatedUser.avatarUrl });
  } catch (error) {
    console.error("Erreur update avatar :", error);
    return NextResponse.json({ success: false, message: "Erreur serveur" }, { status: 500 });
  }
}
