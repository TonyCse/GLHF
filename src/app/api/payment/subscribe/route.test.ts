import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { POST } from "./route";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createPaypalSubscription, cancelPaypalSubscription } from "@/lib/paypal";

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    plan: { findUnique: vi.fn() },
    user: { findFirst: vi.fn(), update: vi.fn() },
  },
}));

vi.mock("@/lib/paypal", () => ({
  createPaypalSubscription: vi.fn(),
  cancelPaypalSubscription: vi.fn(),
}));

describe("POST /api/payment/subscribe", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv, NEXT_PUBLIC_APP_URL: "http://localhost:3000" };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it("refuse si non authentifie", async () => {
    (auth as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    const req = new Request("http://localhost/api/payment/subscribe", {
      method: "POST",
      body: JSON.stringify({ planId: 1 }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("retourne 404 si plan introuvable", async () => {
    (auth as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      user: { email: "user@example.com", id: "1" },
    });
    (prisma.plan.findUnique as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    const req = new Request("http://localhost/api/payment/subscribe", {
      method: "POST",
      body: JSON.stringify({ planId: 1 }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(404);
  });

  it("accepte un plan gratuit", async () => {
    (auth as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      user: { email: "user@example.com", id: "1" },
    });
    (prisma.plan.findUnique as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 1,
      priceCents: 0,
    });
    (prisma.user.findFirst as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      paypalSubscriptionId: null,
    });
    const req = new Request("http://localhost/api/payment/subscribe", {
      method: "POST",
      body: JSON.stringify({ planId: 1 }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
  });

  it("retourne un lien d'approbation pour un plan payant", async () => {
    (auth as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      user: { email: "user@example.com", id: "1" },
    });
    (prisma.plan.findUnique as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 2,
      priceCents: 500,
      paypalPlanId: "P-123",
    });
    (prisma.user.findFirst as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      paypalSubscriptionId: null,
    });
    (createPaypalSubscription as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      approvalUrl: "https://paypal.com/approve",
    });
    const req = new Request("http://localhost/api/payment/subscribe", {
      method: "POST",
      body: JSON.stringify({ planId: 2 }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.approvalUrl).toBe("https://paypal.com/approve");
    expect(cancelPaypalSubscription).toHaveBeenCalledTimes(0);
  });
});
