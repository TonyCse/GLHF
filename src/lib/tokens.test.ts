import { describe, expect, it } from "vitest";
import { getRemainingTokens, type UserWithPlan } from "@/lib/tokens";

describe("getRemainingTokens", () => {
  it("retourne 0 si l'utilisateur est null", () => {
    expect(getRemainingTokens(null)).toBe(0);
  });

  it("calcule les tokens restants", () => {
    const user = {
      tokensUsedThisMonth: 1,
      plan: { tokensPerMonth: 3 },
    } as UserWithPlan;
    expect(getRemainingTokens(user)).toBe(2);
  });

  it("retourne 0 si tous les tokens sont utilises", () => {
    const user = {
      tokensUsedThisMonth: 3,
      plan: { tokensPerMonth: 3 },
    } as UserWithPlan;
    expect(getRemainingTokens(user)).toBe(0);
  });

  it("utilise 3 tokens par defaut si pas de plan", () => {
    const user = { tokensUsedThisMonth: 1, plan: null } as unknown as UserWithPlan;
    expect(getRemainingTokens(user)).toBe(2);
  });

  it("retourne une valeur negative si le depassement de quota", () => {
    const user = {
      tokensUsedThisMonth: 5,
      plan: { tokensPerMonth: 3 },
    } as UserWithPlan;
    expect(getRemainingTokens(user)).toBe(-2);
  });
});
