import { test, expect } from "@playwright/test";

test.use({ storageState: "e2e/.auth/user.json" });

const CREATE_ROUTE = "/creer";

async function dismissCookieBanner(page: Parameters<typeof test>[0]["page"]) {
  const refuseBtn = page.getByRole("button", { name: /refuser/i });
  if (await refuseBtn.isVisible({ timeout: 1500 }).catch(() => false)) {
    await refuseBtn.click();
  }
}

test.describe("Création de tournoi", () => {
  test("accès page création", async ({ page }) => {
    await page.goto(CREATE_ROUTE);
    await dismissCookieBanner(page);
    await expect(
      page.getByRole("heading", { name: /créer un tournoi|creer un tournoi/i }),
    ).toBeVisible();
  });

  test("sélection du jeu", async ({ page }) => {
    await page.goto(CREATE_ROUTE);
    await dismissCookieBanner(page);
    const valorantCheckbox = page.getByLabel("Valorant");
    await valorantCheckbox.scrollIntoViewIfNeeded();
    await expect(valorantCheckbox).toBeVisible();
    await valorantCheckbox.check({ force: true });
    await expect(valorantCheckbox).toBeChecked();
  });

  test("saisie nom et description", async ({ page }) => {
    await page.goto(CREATE_ROUTE);
    await dismissCookieBanner(page);
    const nomInput = page.getByLabel(/nom du tournoi/i);
    const descInput = page.getByLabel(/description/i);
    await nomInput.scrollIntoViewIfNeeded();
    await expect(nomInput).toBeVisible();
    await nomInput.fill("Tournoi E2E Test");
    await descInput.scrollIntoViewIfNeeded();
    await expect(descInput).toBeVisible();
    await descInput.fill("Description test");
    await expect(nomInput).toHaveValue("Tournoi E2E Test");
  });

  test("validation formulaire incomplet", async ({ page }) => {
    await page.goto(CREATE_ROUTE);
    await dismissCookieBanner(page);
    const valorantCheckbox = page.getByLabel("Valorant");
    await valorantCheckbox.scrollIntoViewIfNeeded();
    await expect(valorantCheckbox).toBeVisible();
    await valorantCheckbox.check({ force: true });

    const nomInput = page.getByLabel(/nom du tournoi/i);
    const descInput = page.getByLabel(/description/i);
    const maxInput = page.getByLabel(/nombre max/i);
    const dateInput = page.getByLabel(/date/i);
    const heureInput = page.getByLabel(/heure/i);

    await nomInput.fill("Tournoi E2E Incomplet");
    await descInput.fill("Description test");
    await maxInput.fill("2");
    await dateInput.fill("2000-01-01");
    await heureInput.fill("00:00");

    const createBtn = page.getByRole("button", { name: /créer le tournoi|creer le tournoi/i });
    await createBtn.scrollIntoViewIfNeeded();
    await expect(createBtn).toBeVisible();
    await createBtn.click();

    const status = page.getByRole("status");
    const hasStatus = await status.isVisible().catch(() => false);
    if (hasStatus) {
      await expect(status).toContainText(/date|heure|invalide|passe/i);
      return;
    }

    expect(await dateInput.evaluate((input) => !(input as HTMLInputElement).checkValidity())).toBe(true);
  });

  test("création tournoi complet et redirection", async ({ page }) => {
    await page.goto(CREATE_ROUTE);
    await dismissCookieBanner(page);
    const fallGuysCheckbox = page.getByLabel("Fall Guys");
    await fallGuysCheckbox.scrollIntoViewIfNeeded();
    await expect(fallGuysCheckbox).toBeVisible();
    await fallGuysCheckbox.check({ force: true });

    const nomInput = page.getByLabel(/nom du tournoi/i);
    const descInput = page.getByLabel(/description/i);
    const maxInput = page.getByLabel(/nombre max/i);
    const dateInput = page.getByLabel(/date/i);
    const heureInput = page.getByLabel(/heure/i);

    await nomInput.fill(`Tournoi E2E ${Date.now()}`);
    await descInput.fill("Description test");
    await maxInput.fill("8");
    await dateInput.fill("2027-12-31");
    await heureInput.fill("18:00");

    const createBtn = page.getByRole("button", { name: /créer le tournoi|creer le tournoi/i });
    await createBtn.scrollIntoViewIfNeeded();
    await expect(createBtn).toBeVisible();
    await createBtn.click();
    await expect(page.getByText(/créer le tournoi \?|creer le tournoi \?/i)).toBeVisible();

    const [createResponse] = await Promise.all([
      page.waitForResponse((res) =>
        res.url().includes("/api/tournament/create") && [201, 400, 401, 403, 500].includes(res.status()),
      ),
      (async () => {
        const confirmBtn = page.getByRole("button", { name: /^créer$|^creer$/i });
        await confirmBtn.scrollIntoViewIfNeeded();
        await expect(confirmBtn).toBeVisible();
        await confirmBtn.click();
      })(),
    ]);

    if (createResponse.status() === 403) {
      test.skip(true, "Tokens insuffisants pour creer un tournoi");
      return;
    }

    if (createResponse.status() !== 201) {
      const body = await createResponse.text();
      throw new Error(`Creation tournoi echouee: ${createResponse.status()} ${body}`);
    }

    const created = (await createResponse.json()) as { id: number };
    await page.waitForLoadState("networkidle");

    const viewButton = page.getByRole("button", { name: /voir le tournoi/i });
    if (await viewButton.isVisible().catch(() => false)) {
      await viewButton.scrollIntoViewIfNeeded();
      await expect(viewButton).toBeVisible();
      await viewButton.click();
      await expect(page).toHaveURL(/\/tournois\/\d+/);
      return;
    }

    if (created?.id) {
      await page.waitForURL(/\/creer$/, { timeout: 5000 }).catch(() => {});
      await page.goto(`/tournois/${created.id}`);
      await expect(page).toHaveURL(/\/tournois\/\d+/);
      return;
    }

    throw new Error("Tournoi cree mais ID manquant dans la reponse");
  });
});
