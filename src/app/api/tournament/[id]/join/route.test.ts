import { describe, expect, it, vi, beforeEach } from "vitest";
import { POST } from "./route";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { refreshUserTokensIfNeeded } from "@/lib/tokens";

vi.mock("@/lib/auth", () => ({ auth: vi.fn() }));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: { findFirst: vi.fn() },
    tournament: { findUnique: vi.fn() },
    tournamentParticipant: { findUnique: vi.fn(), updateMany: vi.fn(), update: vi.fn(), create: vi.fn() },
    $transaction: vi.fn(),
  },
}));

vi.mock("@/lib/tokens", () => ({
  refreshUserTokensIfNeeded: vi.fn(),
  getRemainingTokens: vi.fn(),
  refundToken: vi.fn(),
}));

describe("POST /api/tournament/[id]/join", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("retourne 401 si non authentifie", async () => {
    (auth as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    const req = new Request("http://localhost/api/tournament/1/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "join" }),
    });
    const res = await POST(req, { params: Promise.resolve({ id: "1" }) });
    expect(res.status).toBe(401);
  });

  it("retourne 400 si id invalide", async () => {
    (auth as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      user: { email: "user@example.com" },
    });
    const req = new Request("http://localhost/api/tournament/bad/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "join" }),
    });
    const res = await POST(req, { params: Promise.resolve({ id: "bad" }) });
    expect(res.status).toBe(400);
  });

  it("retourne 403 si plus de tokens disponibles", async () => {
    (auth as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      user: { email: "user@example.com" },
    });
    (prisma.user.findFirst as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 1 });
    (refreshUserTokensIfNeeded as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 1,
      tokensUsedThisMonth: 3,
      plan: { tokensPerMonth: 3 },
    });
    (prisma.tournamentParticipant.findUnique as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    (prisma.$transaction as unknown as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error("Tu as utilisé tous tes tokens ce mois-ci. Reviens le mois prochain ou prends un forfait premium."),
    );

    const req = new Request("http://localhost/api/tournament/1/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "join" }),
    });
    const res = await POST(req, { params: Promise.resolve({ id: "1" }) });
    expect(res.status).toBe(403);
  });
});
