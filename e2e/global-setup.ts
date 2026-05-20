import { chromium, expect, type FullConfig, type Page } from "@playwright/test";
import dotenv from "dotenv";
import fs from "node:fs";
import path from "node:path";
import { seedE2E, closeSeedConnection } from "./seed";

dotenv.config({ path: ".env.test" });

const storageStatePath = "e2e/.auth/user.json";

async function dismissCookieBanner(page: Page) {
  const refuseBtn = page.getByRole("button", { name: /refuser/i });
  if (await refuseBtn.isVisible({ timeout: 1500 }).catch(() => false)) {
    await refuseBtn.click();
  }
}

export default async function globalSetup(config: FullConfig) {
  const baseURL = config.projects[0]?.use?.baseURL || "http://localhost:3000";

  if (!process.env.TEST_USER_EMAIL || !process.env.TEST_USER_PASSWORD) {
    throw new Error("TEST_USER_EMAIL/TEST_USER_PASSWORD manquants dans .env.test");
  }

  const shouldSeed = (process.env.E2E_SEED || "false").toLowerCase() === "true";
  if (shouldSeed) {
    await seedE2E();
    await closeSeedConnection();
  }

  fs.mkdirSync(path.dirname(storageStatePath), { recursive: true });

  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.goto(`${baseURL}/connexion`);
  await dismissCookieBanner(page);
  await page.getByLabel(/email/i).fill(process.env.TEST_USER_EMAIL);
  await page.getByLabel(/mot de passe/i).first().fill(process.env.TEST_USER_PASSWORD);
  await page.getByRole("button", { name: /se connecter/i }).click();

  await expect
    .poll(
      async () => {
        const sessionRes = await page.request.get(`${baseURL}/api/auth/session`);
        const session = await sessionRes.json();
        return session?.user?.email ?? null;
      },
      { timeout: 10000 },
    )
    .toBe(process.env.TEST_USER_EMAIL);

  await page.goto(`${baseURL}/`);
  await page.context().storageState({ path: storageStatePath });
  await browser.close();
}
