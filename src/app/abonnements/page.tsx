import type { Metadata } from "next";
import { CreditCard } from "lucide-react";
import { auth } from "@/lib/auth";

import HomeFaqAccordion from "@/components/HomeFaqAccordion";
import ContentPageShell from "@/components/ContentPageShell";
import { prisma } from "@/lib/prisma";
import { refreshUserTokensIfNeeded } from "@/lib/tokens";
import PlanCard from "./PlanCard";
import TokensDisplay from "./TokensDisplay";
import { purchaseAgeNotice } from "@/lib/purchaseNotice";

export const metadata: Metadata = {
  title: "Abonnements | GLHF",
  description:
    "Choisissez votre forfait GLHF pour participer à plus de tournois et débloquer des avantages exclusifs.",
  alternates: {
    canonical: "/abonnements",
  },
};

const DEFAULT_TOKENS_PER_MONTH = 3;

function buildTokensInfo(userWithTokens: Awaited<ReturnType<typeof refreshUserTokensIfNeeded>>) {
  const tokensPerMonth = userWithTokens.plan?.tokensPerMonth ?? DEFAULT_TOKENS_PER_MONTH;
  const rawUsedTokens = userWithTokens.tokensUsedThisMonth;
  const bonusTokens = Math.max(0, -rawUsedTokens);
  const totalTokensThisMonth = tokensPerMonth + bonusTokens;
  const usedTokens = Math.min(Math.max(0, rawUsedTokens), totalTokensThisMonth);
  const remainingTokens = Math.max(0, totalTokensThisMonth - usedTokens);
  return {
    remainingTokens,
    usedTokens,
    totalTokensThisMonth,
    plan: userWithTokens.plan?.name ?? "Plan Gratuit",
    monthStart: userWithTokens.tokensMonthStart?.toISOString() ?? null,
  };
}

const SUBSCRIPTION_FAQS = [
  {
    question: "Comment fonctionnent les tokens GLHF ?",
    answer:
      "Chaque participation à un tournoi coûte 1 token GLHF. Tes tokens se réinitialisent automatiquement chaque mois et ne s'accumulent pas. Si tu quittes un tournoi avant qu'il ne commence, ton token est remboursé.",
    icon: "🪙",
  },
  {
    question: "Puis-je changer de forfait à tout moment ?",
    answer:
      "Oui, tu peux améliorer ton forfait à tout moment. Les changements prennent effet immédiatement et tes tokens sont ajustés selon ton nouveau plan.",
    icon: "🔄",
  },
  {
    question: "Comment annuler mon abonnement ?",
    answer:
      "Tu peux annuler ton abonnement à tout moment depuis ton profil. L'accès premium reste actif jusqu'à la fin de la période payée, puis tu passes automatiquement au plan gratuit.",
    icon: "🧾",
  },
];

export default async function AbonnementsPage() {
  const session = await auth();

  const plans = await prisma.plan.findMany({
    orderBy: { priceCents: "asc" },
  });

  let currentUser = null;
  let initialTokensInfo = null;

  const sessionUserId = session?.user?.id ? Number(session.user.id) : null;
  if (sessionUserId && Number.isFinite(sessionUserId)) {
    const userWithTokens = await refreshUserTokensIfNeeded(sessionUserId);
    currentUser = userWithTokens;
    initialTokensInfo = buildTokensInfo(userWithTokens);
  } else if (session?.user?.email) {
    const userIdRow = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (userIdRow) {
      const userWithTokens = await refreshUserTokensIfNeeded(userIdRow.id);
      currentUser = userWithTokens;
      initialTokensInfo = buildTokensInfo(userWithTokens);
    }
  }

  return (
    <ContentPageShell
      title="Forfaits GLHF"
      description="Choisis le forfait qui te correspond pour participer à plus de tournois et débloquer des fonctionnalités exclusives."
      icon={<CreditCard size={36} className="text-white" />}
      maxWidthClassName="max-w-7xl"
      contentClassName="space-y-12"
    >
      {session && currentUser && (
          <TokensDisplay initialTokensInfo={initialTokensInfo} />
      )}


      <section>
        <div className="mb-4 flex justify-center">
          <div className="rounded-lg bg-[#232426] px-4 py-2 text-xs text-white border border-[#8F60D0]/20 max-w-lg text-center">
            {purchaseAgeNotice}
          </div>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan, index) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              isCurrentPlan={currentUser?.planId === plan.id}
              isLoggedIn={!!session}
              isPopular={index === 2}
            />
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-8 text-center text-3xl font-bold text-white">Questions fréquentes</h2>
        <HomeFaqAccordion items={SUBSCRIPTION_FAQS} className="max-w-none" />
      </section>
    </ContentPageShell>
  );
}
