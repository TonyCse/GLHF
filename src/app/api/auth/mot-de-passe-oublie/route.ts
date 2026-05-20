import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";
import { generatePasswordResetToken } from "@/lib/passwordReset";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const GENERIC_RESPONSE = {
  success: true,
  message:
    "Si un compte existe pour cet email, un lien de réinitialisation vient d'être envoyé.",
};

export async function POST(req: Request) {
  let payload: unknown = null;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ success: false, message: "Payload invalide" }, { status: 400 });
  }

  const schema = z.object({
    email: z.string().trim().toLowerCase().regex(EMAIL_REGEX),
  });
  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ success: false, message: "Email invalide" }, { status: 400 });
  }

  const { email } = parsed.data;
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, pseudo: true, email: true, isDeleted: true },
  });

  if (!user || user.isDeleted) {
    return NextResponse.json(GENERIC_RESPONSE);
  }

  const { token, tokenHash, expiresAt } = generatePasswordResetToken();
  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordResetTokenHash: tokenHash,
      passwordResetTokenExpiresAt: expiresAt,
    },
  });

  try {
    const appUrl =
      process.env.APP_URL || process.env.NEXTAUTH_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
    await sendPasswordResetEmail({
      to: user.email,
      pseudo: user.pseudo,
      token,
      appUrl,
    });
  } catch {
    // Silently fail — generic response prevents user enumeration
  }

  return NextResponse.json(GENERIC_RESPONSE);
}
