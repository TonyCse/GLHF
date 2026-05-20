import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { z } from "zod";

const bodySchema = z.object({
  role: z.enum(["USER", "ADMIN", "SUPER_ADMIN"]),
});

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
    return NextResponse.json({ message: "Accès interdit" }, { status: 403 });
  }

  const isSuperAdmin = session.user.role === "SUPER_ADMIN";

  const resolvedParams = await params;
  const idSchema = z.coerce.number().int().positive();
  const parsedId = idSchema.safeParse(resolvedParams?.id);
  if (!parsedId.success) {
    return NextResponse.json({ message: "ID invalide" }, { status: 400 });
  }
  const id = parsedId.data;

  // Pas d'auto-modification
  if (String(session.user.id) === String(id)) {
    return NextResponse.json({ message: "Impossible de modifier votre propre rôle" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Rôle invalide" }, { status: 400 });
  }
  const newRole: Role = parsed.data.role;

  const user = await prisma.user.findUnique({
    where: { id },
    select: { role: true },
  });
  if (!user) {
    return NextResponse.json({ message: "Utilisateur introuvable" }, { status: 404 });
  }

  // Seul SUPER_ADMIN peut gérer les rôles
  if (!isSuperAdmin) {
    return NextResponse.json({ message: "Réservé au super admin" }, { status: 403 });
  }

  // Un SUPER_ADMIN ne peut pas être modifié par un autre SUPER_ADMIN (sécurité)
  if (user.role === "SUPER_ADMIN" && !isSuperAdmin) {
    return NextResponse.json({ message: "Impossible de modifier un super admin" }, { status: 403 });
  }

  await prisma.user.update({
    where: { id },
    data: { role: newRole },
  });

  return NextResponse.json({ success: true, role: newRole });
}
