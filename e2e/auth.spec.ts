import { test, expect, type Page } from "@playwright/test";

const getSignupSubmitButton = (page: Page) => page.locator('form button[type="submit"]');

async function dismissCookieBanner(page: Page) {
  const refuseBtn = page.getByRole("button", { name: /refuser/i });
  if (await refuseBtn.isVisible({ timeout: 1500 }).catch(() => false)) {
    await refuseBtn.click();
  }
}

async function loginWithTestUser(page: Page) {
  await page.goto("/connexion");
  await dismissCookieBanner(page);
  await expect(page.getByLabel(/email/i)).toBeVisible();
  await expect(page.getByLabel(/mot de passe/i).first()).toBeVisible();
  await page.getByLabel(/email/i).fill(process.env.TEST_USER_EMAIL!);
  await page.getByLabel(/mot de passe/i).first().fill(process.env.TEST_USER_PASSWORD!);

  const loginBtn = page.getByRole("button", { name: /se connecter/i });
  await loginBtn.scrollIntoViewIfNeeded();
  await expect(loginBtn).toBeVisible();
  await loginBtn.click();

  await page.waitForLoadState("networkidle").catch(() => {});
  await page.goto("/");
  await dismissCookieBanner(page);
  await expect(page.getByRole("button", { name: /se déconnecter|deconnexion/i })).toBeVisible({
    timeout: 10000,
  });
}

test.describe("Inscription & Authentification", () => {
  test("accès page inscription", async ({ page }) => {
    await page.goto("/inscription");
    await expect(
      page.getByRole("heading", { name: /creer un compte|créer un compte/i }),
    ).toBeVisible();
  });

  test("saisie formulaire utilisateur", async ({ page }) => {
    await page.goto("/inscription");
    await expect(page.getByLabel(/pseudo/i)).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/mot de passe/i).first()).toBeVisible();
  });

  test("validation email invalide", async ({ page }) => {
    await page.goto("/inscription");
    await page.getByLabel(/pseudo/i).fill(`testuser-${Date.now()}`);
    await page.getByLabel(/email/i).fill("pasunemail");
    await page.getByLabel(/mot de passe/i).first().fill("MotDePasseTest12!");
    await page.getByLabel(/au moins 16 ans/i).check();
    await getSignupSubmitButton(page).click();

    expect(
      await page
        .getByLabel(/email/i)
        .evaluate((input) => (input as HTMLInputElement).validity.typeMismatch),
    ).toBe(true);
  });

  test("validation mot de passe faible", async ({ page }) => {
    await page.goto("/inscription");
    await page.getByLabel(/pseudo/i).fill(`testuser-${Date.now()}`);
    await page.getByLabel(/email/i).fill("test@example.com");
    await page.getByLabel(/mot de passe/i).first().fill("weak");
    await page.getByLabel(/au moins 16 ans/i).check();
    await getSignupSubmitButton(page).click();

    const passwordInput = page.getByLabel(/mot de passe/i).first();
    await expect(passwordInput).toHaveAttribute("minlength", "12");
    expect((await passwordInput.inputValue()).length).toBeLessThan(12);
  });

  test("gestion champs vides", async ({ page }) => {
    await page.goto("/inscription");
    await getSignupSubmitButton(page).click();

    expect(await page.locator("form").evaluate((form) => !(form as HTMLFormElement).checkValidity())).toBe(
      true,
    );
  });

  test("connexion utilisateur valide", async ({ page, browserName }) => {
    test.skip(browserName === "webkit", "Connexion WebKit instable en E2E local");
    await loginWithTestUser(page);
  });

  test("persistance session après navigation", async ({ page, browserName }) => {
    test.skip(browserName === "webkit", "Connexion WebKit instable en E2E local");
    await loginWithTestUser(page);
    await page.goto("/tournois");
    await page.goto("/");
    await expect(page.getByRole("button", { name: /se déconnecter|deconnexion/i })).toBeVisible({
      timeout: 10000,
    });
  });

  test("déconnexion", async ({ page, browserName }) => {
    test.skip(browserName === "webkit", "Connexion WebKit instable en E2E local");
    await loginWithTestUser(page);

    const logoutBtn = page.getByRole("button", { name: /se déconnecter|deconnexion/i });
    await expect(logoutBtn).toBeVisible({ timeout: 10000 });
    await logoutBtn.click();

    await expect(page.getByText(/se déconnecter \?|deconnexion \?/i)).toBeVisible({
      timeout: 10000,
    });

    const confirmLogoutBtn = page.getByRole("button", {
      name: /se déconnecter|deconnexion/i,
    }).last();
    await expect(confirmLogoutBtn).toBeVisible({ timeout: 10000 });
    await confirmLogoutBtn.click();

    await expect(page.getByRole("button", { name: /se déconnecter|deconnexion/i })).toHaveCount(0);
    await expect(page.getByRole("link", { name: /connexion/i }).first()).toBeVisible();
  });
});
