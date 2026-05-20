import { describe, expect, it } from "vitest";
import { validatePassword } from "@/lib/security/password";

describe("validatePassword", () => {
  it("accepte un mot de passe robuste", () => {
    expect(validatePassword("Abcdef12!@#$")).toEqual({ ok: true });
  });

  it("refuse un mot de passe trop court", () => {
    const result = validatePassword("Abc1!");
    expect(result.ok).toBe(false);
  });

  it("refuse un mot de passe sans assez de types", () => {
    const result = validatePassword("abcdefghijkL");
    expect(result.ok).toBe(false);
  });
});
