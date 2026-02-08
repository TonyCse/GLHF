import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
    // non-admin → 403 + retour à la liste
    const back = new URL("/admin/users?err=forbidden", req.url);
    return NextResponse.redirect(back);
  }
  const isSuperAdmin = session.user.role === "SUPER_ADMIN";

  const resolvedParams = await Promise.resolve(params as unknown as { id?: string });
  const idFromParams = resolvedParams?.id;
  const idFromPath = new URL(req.url).pathname.split("/").filter(Boolean).slice(-2, -1)[0];
  const id = Number(idFromParams ?? idFromPath);
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

  if (user.role === "SUPER_ADMIN" && !isSuperAdmin) {
    const back = new URL("/admin/users?err=forbidden", req.url);
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
