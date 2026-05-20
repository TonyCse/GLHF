import type { Metadata } from "next";
import TournamentList from "@/components/TournamentList";
import { auth } from "@/lib/auth";
import { refreshUserTokensIfNeeded } from "@/lib/tokens";
import { getTournamentList } from "@/lib/tournaments";

export const metadata: Metadata = {
  title: "Tournois | GLHF",
  description:
    "Parcourez les tournois GLHF par jeu, statut et disponibilité. Rejoignez les compétitions en cours ou inscrivez-vous aux prochains tournois.",
  alternates: {
    canonical: "/tournois",
  },
};

const DEFAULT_TOKENS_PER_MONTH = 3;

export default async function Page() {
  const [tournois, session] = await Promise.all([getTournamentList(), auth()]);
  let initialTokensInfo = null;
  let showTokensWidget = false;

  const sessionUserId = session?.user?.id ? Number(session.user.id) : null;
  if (sessionUserId && Number.isFinite(sessionUserId)) {
    const userWithTokens = await refreshUserTokensIfNeeded(sessionUserId);
    const tokensPerMonth = userWithTokens.plan?.tokensPerMonth ?? DEFAULT_TOKENS_PER_MONTH;
    const rawUsedTokens = userWithTokens.tokensUsedThisMonth;
    const bonusTokens = Math.max(0, -rawUsedTokens);
    const totalTokensThisMonth = tokensPerMonth + bonusTokens;
    const usedTokens = Math.min(Math.max(0, rawUsedTokens), totalTokensThisMonth);
    const remainingTokens = Math.max(0, totalTokensThisMonth - usedTokens);

    initialTokensInfo = {
      remainingTokens,
      usedTokens,
      totalTokensThisMonth,
      plan: userWithTokens.plan?.name ?? "Plan Gratuit",
      monthStart: userWithTokens.tokensMonthStart
        ? userWithTokens.tokensMonthStart.toISOString()
        : null,
    };
    showTokensWidget = true;
  }

  return (
    <TournamentList
      initialTournois={tournois}
      showTokensWidget={showTokensWidget}
      initialTokensInfo={initialTokensInfo}
    />
  );
}
