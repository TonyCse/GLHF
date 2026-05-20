import { describe, expect, it, vi, beforeEach } from "vitest";
import { POST } from "./route";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: { findFirst: vi.fn(), update: vi.fn() },
    plan: { findUnique: vi.fn() },
  },
}));

describe("POST /api/admin/payments/action", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("retourne 401 si non super admin", async () => {
    (auth as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    const req = new Request("http://localhost/api/admin/payments/action", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "cancel", userId: 1 }),
    });
    const res = await POST(req);
    expect(res.status).toBe(403);
  });

  it("retourne 400 si payload invalide", async () => {
    (auth as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      user: { role: "SUPER_ADMIN" },
    });
    const req = new Request("http://localhost/api/admin/payments/action", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "cancel" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("annule un abonnement", async () => {
    (auth as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      user: { role: "SUPER_ADMIN" },
    });
    (prisma.user.findFirst as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 1,
    });
    (prisma.user.update as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 1,
    });

    const req = new Request("http://localhost/api/admin/payments/action", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "cancel", userId: 1 }),
    });
    const res = await POST(req);
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
  });

  it("change de plan", async () => {
    (auth as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      user: { role: "SUPER_ADMIN" },
    });
    (prisma.plan.findUnique as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 2,
      name: "Premium",
      slug: "premium",
      priceCents: 500,
      currency: "EUR",
      tokensPerMonth: 10,
    });
    (prisma.user.findFirst as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 1,
    });
    (prisma.user.update as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 1,
    });

    const req = new Request("http://localhost/api/admin/payments/action", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "change_plan", userId: 1, planId: 2 }),
    });
    const res = await POST(req);
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.plan?.id).toBe(2);
  });
});
