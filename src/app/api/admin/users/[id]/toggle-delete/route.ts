// src/app/api/admin/users/[id]/toggle-delete/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/admin/users?err=forbidden", req.url));
  }

  const id = Number(params.id);
  if (!Number.isFinite(id)) {
    return NextResponse.redirect(new URL("/admin/users?err=bad_id", req.url));
  }

  // on évite de se soft-delete soi-même
  if (String(session.user.id) === String(id)) {
    return NextResponse.redirect(new URL("/admin/users?err=self_soft_delete_blocked", req.url));
  }

  const user = await prisma.user.findUnique({
    where: { id },
    select: { isDeleted: true },
  });
  if (!user) {
    return NextResponse.redirect(new URL("/admin/users?err=not_found", req.url));
  }

  await prisma.user.update({
    where: { id },
    data: { isDeleted: !user.isDeleted },
  });

  const referer = req.headers.get("referer");
  return NextResponse.redirect(referer ? referer : new URL("/admin/users?ok=soft_toggled", req.url));
}
