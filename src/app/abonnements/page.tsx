import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { refreshUserTokensIfNeeded } from "@/lib/tokens";
import PlanCard from "./PlanCard";
import TokensDisplay from "./TokensDisplay";

export const metadata: Metadata = {
  title: "Abonnements | GLHF",
  description:
    "Choisissez votre forfait GLHF pour participer a plus de tournois et debloquer des avantages exclusifs.",
};

const DEFAULT_TOKENS_PER_MONTH = 3;

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
  } else if (session?.user?.email) {
    const userIdRow = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (userIdRow) {
      const userWithTokens = await refreshUserTokensIfNeeded(userIdRow.id);
      currentUser = userWithTokens;
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
    }
  }

  return (
    <div className="min-h-screen bg-[#232426] text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-[#8F60D0] to-[#A855F7] bg-clip-text text-transparent mb-4">
            Forfaits GLHF
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Choisis le forfait qui te correspond pour participer a plus de tournois et debloquer des fonctionnalites exclusives.
          </p>
        </div>

        {session && currentUser && (
          <div className="mb-12">
            <TokensDisplay user={currentUser} initialTokensInfo={initialTokensInfo} />
          </div>
        )}

        <h2 className="text-3xl font-bold text-center mb-8">Choisir un forfait</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
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

        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">Questions frequentes</h2>
          <div className="grid gap-6">
            <div className="bg-[#1c1d1f] rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-3">Comment fonctionnent les tokens GLHF ?</h3>
              <p className="text-gray-300">
                Chaque participation a un tournoi coute 1 token GLHF. Tes tokens se reinitialisent automatiquement chaque mois
                et ne s'accumulent pas. Si tu quittes un tournoi avant qu'il ne commence, ton token est rembourse.
              </p>
            </div>

            <div className="bg-[#1c1d1f] rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-3">Puis-je changer de forfait a tout moment ?</h3>
              <p className="text-gray-300">
                Oui, tu peux ameliorer ton forfait a tout moment. Les changements prennent effet immediatement et
                tes tokens sont ajustes selon ton nouveau plan.
              </p>
            </div>

            <div className="bg-[#1c1d1f] rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-3">Comment annuler mon abonnement ?</h3>
              <p className="text-gray-300">
                Tu peux annuler ton abonnement a tout moment depuis ton profil. L'acces premium reste actif
                jusqu'a la fin de la periode payee, puis tu passes automatiquement au plan gratuit.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
