import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { z } from "zod";

// Function qui permet de basculer le role d'un utilisateur.
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
    // Non admin -> 403 + retour a la liste
    const back = new URL("/admin/users?err=forbidden", req.url);
    return NextResponse.redirect(back);
  }
  const isSuperAdmin = session.user.role === "SUPER_ADMIN";

  const resolvedParams = await Promise.resolve(params as unknown as { id?: string });
  const idFromParams = resolvedParams?.id;
  const idFromPath = new URL(req.url).pathname.split("/").filter(Boolean).slice(-2, -1)[0];
  const idSchema = z.coerce.number().int().positive();
  const parsedId = idSchema.safeParse(idFromParams ?? idFromPath);
  if (!parsedId.success) {
    const back = new URL("/admin/users?err=bad_id", req.url);
    return NextResponse.redirect(back);
  }
  const id = parsedId.data;

  // (optionnel) eviter qu'un admin se retrograde lui-meme par erreur
  if (String(session.user.id) === String(id)) {
    const back = new URL("/admin/users?err=self_demote_blocked", req.url);
    return NextResponse.redirect(back);
  }

  const user = await prisma.user.findUnique({
    where: { id },
    select: { role: true },
  });

  if (!user) {
    const back = new URL("/admin/users?err=not_found", req.url);
    return NextResponse.redirect(back);
  }

  if (user.role === "SUPER_ADMIN" && !isSuperAdmin) {
    const back = new URL("/admin/users?err=admin_role_restricted", req.url);
    return NextResponse.redirect(back);
  }

  let nextRole: Role;
  if (user.role === "SUPER_ADMIN") {
    nextRole = "ADMIN";
  } else if (user.role === "ADMIN") {
    nextRole = isSuperAdmin ? "SUPER_ADMIN" : "USER";
  } else {
    // Seul un SUPER_ADMIN peut promouvoir un USER en ADMIN
    if (!isSuperAdmin) {
      const back = new URL("/admin/users?err=admin_role_restricted", req.url);
      return NextResponse.redirect(back);
    }
    nextRole = "ADMIN";
  }

  await prisma.user.update({
    where: { id },
    data: { role: nextRole },
  });

  // Redirige vers la page precedente (referent) ou /admin/users
  const referer = req.headers.get("referer");
  const appOrigin = new URL(req.url).origin;
  if (referer) {
    try {
      const refUrl = new URL(referer);
      if (refUrl.origin === appOrigin) return NextResponse.redirect(referer);
    } catch { /* URL invalide, on ignore */ }
  }
  return NextResponse.redirect(new URL("/admin/users?ok=role_updated", req.url));
}
