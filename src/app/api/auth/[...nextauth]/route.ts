// src/app/api/auth/[...nextauth]/route.ts
import { handlers } from "@/lib/auth";

// (Optionnel) évite tout cache sur cette route
export const dynamic = "force-dynamic";

export const { GET, POST } = handlers;
