import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashVerificationToken } from "@/lib/emailVerification";
import { logger } from "@/lib/logger";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json({ success: false, message: "Token manquant" }, { status: 400 });
  }

  try {
    const tokenHash = hashVerificationToken(token);
    const user = await prisma.user.findFirst({
      where: { emailVerificationTokenHash: tokenHash, isDeleted: false },
      select: { id: true, emailVerificationTokenExpiresAt: true },
    });

    if (!user || !user.emailVerificationTokenExpiresAt) {
      return NextResponse.json({ success: false, message: "Token invalide" }, { status: 400 });
    }

    if (user.emailVerificationTokenExpiresAt.getTime() < Date.now()) {
      return NextResponse.json({ success: false, message: "Token expire" }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerifiedAt: new Date(),
        emailVerificationTokenHash: null,
        emailVerificationTokenExpiresAt: null,
      },
    });

    const appUrl =
      process.env.APP_URL || process.env.NEXTAUTH_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
    const acceptsHtml = (req.headers.get("accept") || "").includes("text/html");
    if (acceptsHtml) {
      return NextResponse.redirect(`${appUrl.replace(/\/$/, "")}/connexion?verified=1`);
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    logger.error("verify_email_erreur", { message: err instanceof Error ? err.message : String(err) });
    return NextResponse.json({ success: false, message: "Erreur serveur" }, { status: 500 });
  }
}
