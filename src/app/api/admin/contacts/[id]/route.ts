import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { logger } from "@/lib/logger";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
    return NextResponse.json({ error: "Accès interdit" }, { status: 403 });
  }

  const resolvedParams = await params;
  const idSchema = z.coerce.number().int().positive();
  const parsedId = idSchema.safeParse(resolvedParams.id);
  if (!parsedId.success) {
    return NextResponse.json({ error: "ID invalide" }, { status: 400 });
  }

  const schema = z.object({
    status: z.enum(["EN_COURS", "TRAITE"]),
  });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Payload invalide" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Statut invalide" }, { status: 400 });
  }

  try {
    const contact = await prisma.contactRequest.findUnique({
      where: { id: parsedId.data },
    });
    if (!contact) {
      return NextResponse.json({ error: "Message introuvable" }, { status: 404 });
    }

    const updated = await prisma.contactRequest.update({
      where: { id: parsedId.data },
      data: { status: parsed.data.status },
    });

    return NextResponse.json({ contact: updated });
  } catch (err: unknown) {
    logger.error("admin_contact_patch_erreur", { message: err instanceof Error ? err.message : String(err) });
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
