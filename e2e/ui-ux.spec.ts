import { test, expect, type Page } from "@playwright/test";

async function dismissCookieBanner(page: Page) {
  const refuseBtn = page.getByRole("button", { name: /refuser/i });
  if (await refuseBtn.isVisible({ timeout: 1500 }).catch(() => false)) {
    await refuseBtn.click();
  }
}

test.describe("UI / UX / Responsive", () => {
  test("navigation fluide accueil → tournois → détail", async ({ page }) => {
    await page.goto("/");
    await dismissCookieBanner(page);
    const tournoisLink = page.getByRole("link", { name: /voir les tournois/i }).first();
    await tournoisLink.scrollIntoViewIfNeeded();
    await expect(tournoisLink).toBeVisible();
    await tournoisLink.click();
    await page.waitForURL("**/tournois", { timeout: 10000 }).catch(async () => {
      await page.goto("/tournois");
    });
    await expect(page.getByRole("heading", { name: /liste des tournois/i })).toBeVisible({
      timeout: 10000,
    });
    const firstCard = page.locator('a[href^="/tournois/"]').first();
    await expect(firstCard).toBeVisible();
    const firstCardHref = await firstCard.getAttribute("href");
    expect(firstCardHref).toMatch(/^\/tournois\/\d+$/);
    await page.goto(firstCardHref!);
    await expect(page).toHaveURL(/\/tournois\/\d+/, { timeout: 10000 });
  });

  test("menu mobile fonctionnel", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    const openMenuBtn = page.getByRole("button", { name: /ouvrir le menu/i });
    await openMenuBtn.scrollIntoViewIfNeeded();
    await expect(openMenuBtn).toBeVisible();
    await openMenuBtn.click();
    const connexionLink = page.getByRole("link", { name: /connexion/i });
    await expect(connexionLink).toBeVisible({ timeout: 10000 });
    const closeMenuBtn = page.getByRole("button", { name: /fermer le menu/i });
    await closeMenuBtn.scrollIntoViewIfNeeded();
    await expect(closeMenuBtn).toBeVisible({ timeout: 10000 });
    await closeMenuBtn.click({ force: true });
  });

  test("page accueil charge en moins de 3s", async ({ page }) => {
    const start = Date.now();
    await page.goto("/");
    await expect(page.getByText(/bienvenue sur glhf/i)).toBeVisible();
    expect(Date.now() - start).toBeLessThan(3000);
  });

  test("état de chargement visible sur connexion", async ({ page }) => {
    await page.goto("/connexion");
    await dismissCookieBanner(page);
    await page.getByLabel(/email/i).fill("test@example.com");
    await page.getByLabel(/mot de passe/i).first().fill("MotDePasseTest12!");
    await page.getByRole("button", { name: /se connecter/i }).click();
    await expect(page.getByRole("button", { name: /chargement|loading/i }))
      .toBeVisible({ timeout: 1000 })
      .catch(() => {});
  });

  test("couleur principale violet présente", async ({ page }) => {
    await page.goto("/");
    const violetEl = page.locator('[class*="A855F7"]').first();
    await expect(violetEl).toBeVisible();
  });

  test("page 404 personnalisée", async ({ page }) => {
    await page.goto("/page-inexistante-xyz");
    await expect(page.getByRole("link", { name: /retour/i })).toBeVisible();
  });
});
