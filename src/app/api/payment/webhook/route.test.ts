import { describe, expect, it, vi, beforeEach } from "vitest";
import { POST } from "./route";
import { verifyPaypalWebhookSignature } from "@/lib/paypal";
import { prisma } from "@/lib/prisma";

vi.mock("@/lib/paypal", () => ({
  verifyPaypalWebhookSignature: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: { findFirst: vi.fn(), update: vi.fn() },
    plan: { findFirst: vi.fn() },
  },
}));

describe("POST /api/payment/webhook", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("refuse si la signature est invalide", async () => {
    (verifyPaypalWebhookSignature as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(false);
    const req = new Request("http://localhost/api/payment/webhook", {
      method: "POST",
      body: JSON.stringify({ event_type: "BILLING.SUBSCRIPTION.CREATED", resource: { id: "sub" } }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("accepte un evenement valide", async () => {
    (verifyPaypalWebhookSignature as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(true);
    const req = new Request("http://localhost/api/payment/webhook", {
      method: "POST",
      body: JSON.stringify({ event_type: "BILLING.SUBSCRIPTION.CREATED", resource: { id: "sub" } }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
  });

  it("traite BILLING.SUBSCRIPTION.ACTIVATED et met a jour le plan", async () => {
    (verifyPaypalWebhookSignature as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(true);
    (prisma.plan.findFirst as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 2,
      paypalPlanId: "plan_abc",
    });
    (prisma.user.update as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({});

    const req = new Request("http://localhost/api/payment/webhook", {
      method: "POST",
      body: JSON.stringify({
        event_type: "BILLING.SUBSCRIPTION.ACTIVATED",
        resource: { id: "sub_123", custom_id: "42", plan_id: "plan_abc" },
      }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(prisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 42 } }),
    );
  });

  it("traite BILLING.SUBSCRIPTION.CANCELLED et remet le plan gratuit", async () => {
    (verifyPaypalWebhookSignature as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(true);
    (prisma.plan.findFirst as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 1 });
    (prisma.user.update as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({});

    const req = new Request("http://localhost/api/payment/webhook", {
      method: "POST",
      body: JSON.stringify({
        event_type: "BILLING.SUBSCRIPTION.CANCELLED",
        resource: { id: "sub_123", custom_id: "42" },
      }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(prisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ planId: 1, paypalSubscriptionId: null }),
      }),
    );
  });
});
