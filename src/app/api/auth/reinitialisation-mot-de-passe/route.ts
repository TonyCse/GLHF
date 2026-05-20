import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { validatePassword } from "@/lib/security/password";
import { hashPasswordResetToken } from "@/lib/passwordReset";

async function getResetUser(token: string) {
  const tokenHash = hashPasswordResetToken(token);
  return prisma.user.findFirst({
    where: { passwordResetTokenHash: tokenHash, isDeleted: false },
    select: {
      id: true,
      passwordResetTokenExpiresAt: true,
    },
  });
}

async function clearResetToken(userId: number) {
  await prisma.user.update({
    where: { id: userId },
    data: {
      passwordResetTokenHash: null,
      passwordResetTokenExpiresAt: null,
    },
  });
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json({ success: false, message: "Token manquant" }, { status: 400 });
  }

  const user = await getResetUser(token);
  if (!user || !user.passwordResetTokenExpiresAt) {
    return NextResponse.json({ success: false, message: "Lien invalide" }, { status: 400 });
  }

  if (user.passwordResetTokenExpiresAt.getTime() < Date.now()) {
    await clearResetToken(user.id);
    return NextResponse.json({ success: false, message: "Lien expiré" }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}

export async function POST(req: Request) {
  let payload: unknown = null;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ success: false, message: "Payload invalide" }, { status: 400 });
  }

  const schema = z.object({
    token: z.string().min(1),
    password: z.string(),
  });
  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ success: false, message: "Champs invalides" }, { status: 400 });
  }

  const { token, password } = parsed.data;
  const passwordCheck = validatePassword(password);
  if (!passwordCheck.ok) {
    return NextResponse.json({ success: false, message: passwordCheck.message }, { status: 400 });
  }

  const user = await getResetUser(token);
  if (!user || !user.passwordResetTokenExpiresAt) {
    return NextResponse.json({ success: false, message: "Lien invalide" }, { status: 400 });
  }

  if (user.passwordResetTokenExpiresAt.getTime() < Date.now()) {
    await clearResetToken(user.id);
    return NextResponse.json({ success: false, message: "Lien expiré" }, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      passwordResetTokenHash: null,
      passwordResetTokenExpiresAt: null,
    },
  });

  return NextResponse.json({
    success: true,
    message: "Mot de passe mis à jour",
  });
}
