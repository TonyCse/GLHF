import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    // non-admin → 403 + retour à la liste
    const back = new URL("/admin/users?err=forbidden", req.url);
    return NextResponse.redirect(back);
  }

  const id = Number(params.id);
  if (!Number.isFinite(id)) {
    const back = new URL("/admin/users?err=bad_id", req.url);
    return NextResponse.redirect(back);
  }

  // (optionnel) éviter qu’un admin se rétrograde lui-même par erreur
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

  const nextRole = user.role === "ADMIN" ? "USER" : "ADMIN";

  await prisma.user.update({
    where: { id },
    data: { role: nextRole },
  });

  // Redirige vers la page précédente (référent) ou /admin/users
  const referer = req.headers.get("referer");
  if (referer) return NextResponse.redirect(referer);
  return NextResponse.redirect(new URL("/admin/users?ok=role_updated", req.url));
}
