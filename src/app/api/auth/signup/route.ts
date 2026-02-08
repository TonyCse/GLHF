import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

const PSEUDO_REGEX = /^[a-zA-Z0-9._-]{3,20}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_MIN = 8;
const PASSWORD_MAX = 72;
const PASSWORD_RULES = {
  lower: /[a-z]/,
  upper: /[A-Z]/,
  number: /\d/,
  special: /[^A-Za-z0-9]/,
  whitespace: /\s/,
};

export async function POST(req: Request) {
  let payload: { pseudo?: string; email?: string; password?: string } | null = null;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ success: false, message: "Payload invalide" }, { status: 400 });
  }

  const pseudo = typeof payload?.pseudo === "string" ? payload.pseudo.trim() : "";
  const email = typeof payload?.email === "string" ? payload.email.trim().toLowerCase() : "";
  const password = typeof payload?.password === "string" ? payload.password : "";

  if (!pseudo || !email || !password) {
    return NextResponse.json({ success: false, message: "Champs requis" }, { status: 400 });
  }

  if (!PSEUDO_REGEX.test(pseudo)) {
    return NextResponse.json(
      { success: false, message: "Pseudo invalide (3-20 caracteres, lettres/nombres/._-)" },
      { status: 400 }
    );
  }

  if (!EMAIL_REGEX.test(email)) {
    return NextResponse.json({ success: false, message: "Email invalide" }, { status: 400 });
  }

  const passwordBytes = Buffer.byteLength(password, "utf8");
  if (
    password.length < PASSWORD_MIN ||
    password.length > PASSWORD_MAX ||
    passwordBytes > PASSWORD_MAX ||
    PASSWORD_RULES.whitespace.test(password) ||
    !PASSWORD_RULES.lower.test(password) ||
    !PASSWORD_RULES.upper.test(password) ||
    !PASSWORD_RULES.number.test(password) ||
    !PASSWORD_RULES.special.test(password)
  ) {
    return NextResponse.json(
      {
        success: false,
        message: "Mot de passe trop faible (8-72 caracteres, maj/min/chiffre/special, sans espace)",
      },
      { status: 400 }
    );
  }

  const [existingEmail, existingPseudo] = await Promise.all([
    prisma.user.findUnique({ where: { email } }),
    prisma.user.findUnique({ where: { pseudo } }),
  ]);
  if (existingEmail) {
    return NextResponse.json({ success: false, message: "Email deja utilise" }, { status: 409 });
  }
  if (existingPseudo) {
    return NextResponse.json({ success: false, message: "Pseudo deja utilise" }, { status: 409 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const freePlan = await prisma.plan.findFirst({
    where: { priceCents: 0 },
  });

  await prisma.user.create({
    data: {
      pseudo,
      email,
      password: hashedPassword,
      avatarUrl: `https://api.dicebear.com/9.x/lorelei/png?seed=${encodeURIComponent(pseudo)}`,
      planId: freePlan?.id || null,
    },
  });

  return NextResponse.json({ success: true, message: "Utilisateur cree" });
}
