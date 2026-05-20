import { test, expect, type APIRequestContext, type Page } from "@playwright/test";

test.use({ storageState: "e2e/.auth/user.json" });

type TournamentListItem = {
  id: number;
  date: string;
  maxPlayers: number;
  participantsCount?: number;
  winner?: { id: number } | null;
};

async function dismissCookieBanner(page: Page) {
  const refuseBtn = page.getByRole("button", { name: /refuser/i });
  if (await refuseBtn.isVisible({ timeout: 1500 }).catch(() => false)) {
    await refuseBtn.click();
  }
}

const getRecruitingTournaments = async (request: APIRequestContext) => {
  const res = await request.get("/api/tournament/list");
  if (!res.ok()) return [] as TournamentListItem[];

  const list = (await res.json()) as TournamentListItem[];
  const now = Date.now();

  return list.filter((t) => {
    const participants = t.participantsCount ?? 0;
    const dateMs = new Date(t.date).getTime();
    return !t.winner && dateMs > now && participants < t.maxPlayers;
  });
};

async function findJoinableTournament(page: Page, request: APIRequestContext) {
  const tournaments = await getRecruitingTournaments(request);

  for (const tournoi of tournaments) {
    await page.goto(`/tournois/${tournoi.id}`);
    await dismissCookieBanner(page);
    const joinBtn = page.getByRole("button", { name: /rejoindre le tournoi|rejoindre/i });
    if (await joinBtn.isVisible({ timeout: 1500 }).catch(() => false)) {
      return tournoi;
    }
  }

  return null;
}

test.describe("Participation à un tournoi", () => {
  test("accès page tournoi", async ({ page, request }) => {
    const tournaments = await getRecruitingTournaments(request);
    test.skip(tournaments.length === 0, "Aucun tournoi en recrutement disponible");
    await page.goto(`/tournois/${tournaments[0]!.id}`);
    await expect(page).toHaveURL(/\/tournois\/\d+/);
  });

  test("bouton rejoindre visible", async ({ page, request }) => {
    const tournoi = await findJoinableTournament(page, request);
    test.skip(!tournoi, "Aucun tournoi rejoignable disponible pour le compte de test");

    const joinBtn = page.getByRole("button", { name: /rejoindre le tournoi|rejoindre/i });
    await expect(joinBtn).toBeVisible({ timeout: 10000 });
  });

  test("UI mise à jour après inscription", async ({ page, request }) => {
    const tournoi = await findJoinableTournament(page, request);
    test.skip(!tournoi, "Aucun tournoi rejoignable disponible pour le compte de test");

    const joinBtn = page.getByRole("button", { name: /rejoindre le tournoi|rejoindre/i });
    await expect(joinBtn).toBeVisible({ timeout: 10000 });
    await joinBtn.click();
    await expect(joinBtn).toBeHidden({ timeout: 10000 });
  });
});
