import { NextResponse } from "next/server";
import { z } from "zod";
import { sendContactEmail } from "@/lib/email";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const ContactSchema = z.object({
  message: z.string().trim().min(5).max(5000),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json(
      { success: false, message: "Connexion requise pour envoyer un message" },
      { status: 401 },
    );
  }

  let payload: unknown = null;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ success: false, message: "Payload invalide" }, { status: 400 });
  }

  const parsed = ContactSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        message: "Champs invalides",
        errors: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  const message = parsed.data.message;
  const name = session.user.pseudo || session.user.name || session.user.email;
  const email = session.user.email;

  const user = await prisma.user.findFirst({
    where: { email: session.user.email, isDeleted: false },
    select: { id: true },
  });
  if (!user) {
    return NextResponse.json(
      { success: false, message: "Utilisateur introuvable" },
      { status: 404 },
    );
  }

  const userId = user.id;
  const now = new Date();
  const startOfDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const sentToday = await prisma.contactRequest.count({
    where: {
      userId,
      createdAt: {
        gte: startOfDay,
      },
    },
  });
  if (sentToday >= 5) {
    return NextResponse.json(
      { success: false, message: "Limite de 5 messages par jour atteinte" },
      { status: 429 },
    );
  }

  try {
    await sendContactEmail({ name, fromEmail: email, message });
    await prisma.contactRequest.create({ data: { userId, message } });
  } catch (error) {
    const err = error as Error & { code?: string };
    const debug = (process.env.CONTACT_DEBUG || "").toLowerCase() === "true";
    return NextResponse.json(
      {
        success: false,
        message: "Erreur lors de l'envoi du message",
        error: debug ? { message: err?.message, code: err?.code } : undefined,
      },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true });
}
