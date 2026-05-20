import { describe, expect, it, vi, beforeEach } from "vitest";
import { POST } from "./route";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock("@/lib/email", () => ({
  sendPasswordResetEmail: vi.fn(),
}));

describe("POST /api/auth/mot-de-passe-oublie", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("retourne 400 si l'email est invalide", async () => {
    const req = new Request("http://localhost/api/auth/mot-de-passe-oublie", {
      method: "POST",
      body: JSON.stringify({ email: "invalid" }),
      headers: { "Content-Type": "application/json" },
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("retourne une reponse generique si l'utilisateur n'existe pas", async () => {
    (prisma.user.findUnique as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(null);

    const req = new Request("http://localhost/api/auth/mot-de-passe-oublie", {
      method: "POST",
      body: JSON.stringify({ email: "user@example.com" }),
      headers: { "Content-Type": "application/json" },
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(prisma.user.update).not.toHaveBeenCalled();
    expect(sendPasswordResetEmail).not.toHaveBeenCalled();
  });

  it("genere un token et envoie un email si l'utilisateur existe", async () => {
    (prisma.user.findUnique as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 1,
      pseudo: "user1",
      email: "user@example.com",
      isDeleted: false,
    });
    (prisma.user.update as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({});

    const req = new Request("http://localhost/api/auth/mot-de-passe-oublie", {
      method: "POST",
      body: JSON.stringify({ email: "user@example.com" }),
      headers: { "Content-Type": "application/json" },
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(prisma.user.update).toHaveBeenCalled();
    expect(sendPasswordResetEmail).toHaveBeenCalled();
  });
});
