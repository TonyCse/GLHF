import { beforeEach, describe, expect, it, vi } from "vitest";
import bcrypt from "bcryptjs";
import { GET, POST } from "./route";
import { prisma } from "@/lib/prisma";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findFirst: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock("bcryptjs", () => ({
  default: {
    hash: vi.fn(),
  },
}));

describe("/api/auth/reinitialisation-mot-de-passe", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("GET retourne 400 si le token est absent", async () => {
    const req = new Request("http://localhost/api/auth/reinitialisation-mot-de-passe");
    const res = await GET(req);
    expect(res.status).toBe(400);
  });

  it("POST retourne 400 si le mot de passe est faible", async () => {
    const req = new Request("http://localhost/api/auth/reinitialisation-mot-de-passe", {
      method: "POST",
      body: JSON.stringify({ token: "token", password: "weak" }),
      headers: { "Content-Type": "application/json" },
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("POST met a jour le mot de passe si le token est valide", async () => {
    (prisma.user.findFirst as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 1,
      passwordResetTokenExpiresAt: new Date(Date.now() + 60_000),
    });
    (prisma.user.update as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({});
    (bcrypt.hash as unknown as ReturnType<typeof vi.fn>).mockResolvedValue("hashed-password");

    const req = new Request("http://localhost/api/auth/reinitialisation-mot-de-passe", {
      method: "POST",
      body: JSON.stringify({ token: "valid-token", password: "Abcdef12!@#$" }),
      headers: { "Content-Type": "application/json" },
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(bcrypt.hash).toHaveBeenCalledWith("Abcdef12!@#$", 10);
    expect(prisma.user.update).toHaveBeenCalledTimes(1);
  });
});
