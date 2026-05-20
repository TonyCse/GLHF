import { describe, expect, it, vi, beforeEach } from "vitest";
import { POST } from "./route";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getRemainingTokens, refreshUserTokensIfNeeded } from "@/lib/tokens";

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: { findFirst: vi.fn(), updateMany: vi.fn() },
    tournament: { create: vi.fn() },
    $transaction: vi.fn(),
  },
}));

vi.mock("@/lib/tokens", () => ({
  refreshUserTokensIfNeeded: vi.fn(),
  getRemainingTokens: vi.fn(),
}));

describe("POST /api/tournament/create", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("retourne 401 si non authentifie", async () => {
    (auth as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    const req = new Request("http://localhost/api/tournament/create", { method: "POST" });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("retourne 400 si formulaire incomplet", async () => {
    (auth as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      user: { email: "user@example.com" },
    });
    const formData = new FormData();
    formData.append("name", "Test");
    const req = new Request("http://localhost/api/tournament/create", {
      method: "POST",
      body: formData,
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("cree un tournoi", async () => {
    (auth as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      user: { email: "user@example.com" },
    });
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    monthStart.setHours(0, 0, 0, 0);

    const userWithTokens = {
      id: 1,
      tokensUsedThisMonth: 0,
      tokensMonthStart: monthStart,
      plan: { tokensPerMonth: 3 },
    };
    (prisma.user.findFirst as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 1,
    });
    (refreshUserTokensIfNeeded as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(userWithTokens);
    (getRemainingTokens as unknown as ReturnType<typeof vi.fn>).mockReturnValue(3);
    (prisma.tournament.create as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 10,
      name: "Test",
    });
    (prisma.user.updateMany as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      count: 1,
    });
    (prisma.$transaction as unknown as ReturnType<typeof vi.fn>).mockImplementation(
      async (callback: (tx: typeof prisma) => Promise<unknown>) => {
        const tx = {
          tournament: { create: prisma.tournament.create },
          user: { updateMany: prisma.user.updateMany },
        } as typeof prisma;
        return callback(tx);
      },
    );

    const formData = new FormData();
    formData.append("name", "Test");
    formData.append("description", "Desc");
    formData.append("maxPlayers", "8");
    formData.append("date", "2099-02-14");
    formData.append("time", "18:00");
    formData.append("game", "VALORANT");

    const req = new Request("http://localhost/api/tournament/create", {
      method: "POST",
      body: formData,
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
  });
});
