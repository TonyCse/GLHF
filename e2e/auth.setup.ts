import { test as setup, expect, type Page } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const storageStatePath = "e2e/.auth/user.json";

async function dismissCookieBanner(page: Page) {
  const refuseBtn = page.getByRole("button", { name: /refuser/i });
  if (await refuseBtn.isVisible({ timeout: 1500 }).catch(() => false)) {
    await refuseBtn.click();
  }
}

setup("auth", async ({ page }) => {
  await page.goto("/connexion");
  await dismissCookieBanner(page);
  await page.getByLabel(/email/i).fill(process.env.TEST_USER_EMAIL!);
  await page.getByLabel(/mot de passe/i).first().fill(process.env.TEST_USER_PASSWORD!);
  await page.getByRole("button", { name: /se connecter/i }).click();

  await expect
    .poll(
      async () => {
        const sessionRes = await page.request.get("/api/auth/session");
        const session = await sessionRes.json();
        return session?.user?.email ?? null;
      },
      { timeout: 10000 },
    )
    .toBe(process.env.TEST_USER_EMAIL);

  await page.goto("/");
  fs.mkdirSync(path.dirname(storageStatePath), { recursive: true });
  await page.context().storageState({ path: storageStatePath });
});
