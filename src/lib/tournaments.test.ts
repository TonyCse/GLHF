import { describe, expect, it, vi } from "vitest";
import { getTournamentList } from "@/lib/tournaments";
import { prisma } from "@/lib/prisma";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    tournament: {
      findMany: vi.fn(),
    },
  },
}));

describe("getTournamentList", () => {
  it("mappe les donnees et masque les utilisateurs supprimes", async () => {
    (prisma.tournament.findMany as unknown as ReturnType<typeof vi.fn>).mockResolvedValue([
      {
        id: 1,
        name: "T1",
        description: null,
        maxPlayers: 8,
        date: new Date("2025-01-01T00:00:00Z"),
        createdAt: new Date("2024-01-01T00:00:00Z"),
        game: "VALORANT",
        createdBy: { pseudo: "Jean", isDeleted: true },
        participants: [{ id: 1 }, { id: 2 }],
        winner: { id: 7, pseudo: "Sam", isDeleted: true, avatarUrl: null },
      },
    ]);

    const result = await getTournamentList();
    expect(result[0].createdBy?.pseudo).toBe("Utilisateur introuvable");
    expect(result[0].participantsCount).toBe(2);
    expect(result[0].winner?.pseudo).toBe("Utilisateur introuvable");
  });
});
