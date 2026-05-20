import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

export async function GET() {
  const session = await auth();
  if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
    return NextResponse.json({ error: "Accès interdit" }, { status: 403 });
  }

  try {
    const contacts = await prisma.contactRequest.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: { id: true, pseudo: true, email: true },
        },
      },
    });

    return NextResponse.json({ contacts });
  } catch (err: unknown) {
    logger.error("admin_contacts_get_erreur", { message: err instanceof Error ? err.message : String(err) });
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
