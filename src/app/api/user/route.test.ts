import { describe, expect, it, vi } from "vitest";
import { GET } from "./route";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: { findFirst: vi.fn() },
  },
}));

describe("GET /api/user", () => {
  it("retourne 400 si email manquant", async () => {
    (auth as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      user: { email: "user@example.com" },
    });
    const req = new Request("http://localhost/api/user");
    const res = await GET(req);
    expect(res.status).toBe(400);
  });

  it("retourne un utilisateur", async () => {
    (auth as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      user: { email: "user@example.com" },
    });
    (prisma.user.findFirst as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 1,
      pseudo: "user",
      avatarUrl: "",
      createdAt: new Date(),
      tournamentParticipations: [],
      createdTournaments: [],
      tournamentsWon: 0,
      ranking: 0,
      matchHistory: [],
      plan: null,
    });
    const req = new Request("http://localhost/api/user?email=user@example.com");
    const res = await GET(req);
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.id).toBe(1);
  });
});
