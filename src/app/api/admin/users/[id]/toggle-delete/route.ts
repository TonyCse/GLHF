// Route pour basculer le soft-delete d'un utilisateur.
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Function qui permet de basculer le soft-delete d'un utilisateur.
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
    return NextResponse.redirect(new URL("/admin/users?err=forbidden", req.url));
  }
  const isSuperAdmin = session.user.role === "SUPER_ADMIN";

  const { id: idFromParams } = await params;
  const idFromPath = new URL(req.url).pathname.split("/").filter(Boolean).slice(-2, -1)[0];
  const idSchema = z.coerce.number().int().positive();
  const parsedId = idSchema.safeParse(idFromParams ?? idFromPath);
  if (!parsedId.success) {
    return NextResponse.redirect(new URL("/admin/users?err=bad_id", req.url));
  }
  const id = parsedId.data;

  // On evite de se soft-delete soi-meme
  if (String(session.user.id) === String(id)) {
    return NextResponse.redirect(new URL("/admin/users?err=self_soft_delete_blocked", req.url));
  }

  const user = await prisma.user.findUnique({
    where: { id },
    select: { isDeleted: true, role: true },
  });
  if (!user) {
    return NextResponse.redirect(new URL("/admin/users?err=not_found", req.url));
  }
  if (user.role === "SUPER_ADMIN" && !isSuperAdmin) {
    return NextResponse.redirect(new URL("/admin/users?err=forbidden", req.url));
  }

  await prisma.user.update({
    where: { id },
    data: { isDeleted: !user.isDeleted },
  });

  const referer = req.headers.get("referer");
  const appOrigin = new URL(req.url).origin;
  let safeRedirect = new URL("/admin/users?ok=soft_toggled", req.url).toString();
  if (referer) {
    try {
      const refUrl = new URL(referer);
      if (refUrl.origin === appOrigin) safeRedirect = referer;
    } catch { /* URL invalide, on ignore */ }
  }
  return NextResponse.redirect(safeRedirect);
}
