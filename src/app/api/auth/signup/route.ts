import { NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  const { pseudo, email, password } = await req.json();

  if (!pseudo || !email || !password) {
    return NextResponse.json({ success: false, message: 'Champs requis' }, { status: 400 });
  }

  const userExist = await prisma.user.findUnique({ where: { email } });
  if (userExist) {
    return NextResponse.json({ success: false, message: 'Email déjà utilisé' }, { status: 409 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  // Récupérer le plan gratuit
  const freePlan = await prisma.plan.findFirst({
    where: { priceCents: 0 }
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
  

  return NextResponse.json({ success: true, message: 'Utilisateur créé' });
}
