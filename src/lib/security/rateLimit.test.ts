import { describe, expect, it } from "vitest";
import { isBlocked, recordFailure, resetAttempts } from "@/lib/security/rateLimit";

describe("rateLimit", () => {
  it("bloque apres plusieurs echecs", () => {
    const key = "user@example.com|127.0.0.1";
    resetAttempts(key);
    for (let i = 0; i < 5; i += 1) {
      recordFailure(key);
    }
    const status = isBlocked(key);
    expect(status.blocked).toBe(true);
  });

  it("reset supprime le blocage", () => {
    const key = "user2@example.com|127.0.0.1";
    resetAttempts(key);
    for (let i = 0; i < 5; i += 1) {
      recordFailure(key);
    }
    resetAttempts(key);
    const status = isBlocked(key);
    expect(status.blocked).toBe(false);
  });
});