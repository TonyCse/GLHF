import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import { verifyPaypalWebhookSignature } from "@/lib/paypal";

describe("verifyPaypalWebhookSignature", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      PAYPAL_WEBHOOK_ID: "wh_123",
      PAYPAL_BASE_URL: "https://api-m.sandbox.paypal.com",
      PAYPAL_CLIENT_ID: "id",
      PAYPAL_CLIENT_SECRET: "secret",
    };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("retourne false si le webhook id est manquant", async () => {
    process.env.PAYPAL_WEBHOOK_ID = "";
    const result = await verifyPaypalWebhookSignature({}, new Headers());
    expect(result).toBe(false);
  });

  it("retourne false si les headers PayPal sont manquants", async () => {
    const result = await verifyPaypalWebhookSignature({}, new Headers());
    expect(result).toBe(false);
  });

  it("retourne false si PayPal repond avec un statut non-ok", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ access_token: "token" }) })
      .mockResolvedValueOnce({ ok: false });
    vi.stubGlobal("fetch", fetchMock as unknown as typeof fetch);

    const headers = new Headers({
      "paypal-transmission-id": "t",
      "paypal-transmission-time": "2020-01-01T00:00:00Z",
      "paypal-transmission-sig": "sig",
      "paypal-cert-url": "https://api-m.sandbox.paypal.com/cert",
      "paypal-auth-algo": "SHA256withRSA",
    });
    const result = await verifyPaypalWebhookSignature({}, headers);
    expect(result).toBe(false);
  });

  it("retourne true quand PayPal verifie", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ access_token: "token" }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ verification_status: "SUCCESS" }),
      });
    vi.stubGlobal("fetch", fetchMock as unknown as typeof fetch);

    const headers = new Headers({
      "paypal-transmission-id": "t",
      "paypal-transmission-time": "2020-01-01T00:00:00Z",
      "paypal-transmission-sig": "sig",
      "paypal-cert-url": "https://api-m.sandbox.paypal.com/cert",
      "paypal-auth-algo": "SHA256withRSA",
    });

    const result = await verifyPaypalWebhookSignature({ event_type: "TEST" }, headers);
    expect(result).toBe(true);
  });
});
