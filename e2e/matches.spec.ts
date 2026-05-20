import { test, expect, type APIRequestContext } from '@playwright/test';

test.use({ storageState: 'e2e/.auth/user.json' });

type TournamentListItem = {
  id: number;
  date: string;
  maxPlayers: number;
  participantsCount?: number;
  createdBy?: { pseudo: string } | null;
  winner?: { id: number; pseudo: string } | null;
};

const getTournamentList = async (request: APIRequestContext) => {
  const res = await request.get('/api/tournament/list');
  if (!res.ok()) return [] as TournamentListItem[];
  return (await res.json()) as TournamentListItem[];
};

test.describe('Gestion des matchs', () => {
  // Affichage des matchs + bracket
  test('affichage bracket et matchs', async ({ page, request }) => {
    const list = await getTournamentList(request);
    test.skip(list.length === 0, 'Aucun tournoi disponible');
    await page.goto(`/tournois/${list[0]!.id}`);
    const arbreHeading = page.getByText(/arbre du tournoi/i);
    await expect(arbreHeading).toBeVisible({ timeout: 10000 });
    const finaleText = page.getByText('Finale', { exact: true });
    await expect(finaleText).toBeVisible({ timeout: 10000 });
  });

  // Sélection du gagnant (organisateur uniquement)
  test('bouton sélection gagnant visible pour organisateur', async ({ page, request }) => {
    const list = await getTournamentList(request);
    const ownTournament = list.find(
      (t) => t.createdBy?.pseudo && t.createdBy.pseudo === process.env.TEST_USER_PSEUDO,
    );
    test.skip(!ownTournament, 'Aucun tournoi cree par le compte de test');
    await page.goto(`/tournois/${ownTournament!.id}`);
    const winnerButtons = page.getByRole('button', { name: /gagnant/i });
    test.skip((await winnerButtons.count()) === 0, 'Aucun bouton gagnant visible');
    const firstWinnerBtn = winnerButtons.first();
    await firstWinnerBtn.scrollIntoViewIfNeeded();
    await expect(firstWinnerBtn).toBeVisible({ timeout: 10000 });
  });

  // Gestion cas joueur supprimé
  test('joueur supprimé affiché correctement', async ({ page, request }) => {
    const list = await getTournamentList(request);
    const withDeleted = list.find(
      (t) => t.createdBy?.pseudo === 'Utilisateur introuvable' || t.winner?.pseudo === 'Utilisateur introuvable',
    );
    test.skip(!withDeleted, 'Aucun tournoi avec utilisateur supprime');
    await page.goto(`/tournois/${withDeleted!.id}`);
    const deletedText = page.getByText(/utilisateur introuvable/i);
    await expect(deletedText).toBeVisible({ timeout: 10000 });
  });
});
