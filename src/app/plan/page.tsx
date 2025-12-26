import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import PlanCard from "./PlanCard";
import TokensDisplay from "./TokensDisplay";

export default async function PlanPage() {
  const session = await getServerSession(authOptions);
  
  // Récupérer les plans disponibles
  const plans = await prisma.plan.findMany({
    orderBy: { priceCents: 'asc' }
  });

  // Récupérer les informations de l'utilisateur actuel si connecté
  let currentUser = null;
  if (session?.user?.email) {
    currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { plan: true }
    });
  }

  return (
    <div className="min-h-screen bg-[#232426] text-white">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-[#8F60D0] to-[#A855F7] bg-clip-text text-transparent mb-4">
            Forfaits GLHF
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Choisis le forfait qui te correspond pour participer à plus de tournois et débloquer des fonctionnalités exclusives.
          </p>
        </div>

        {/* Affichage des tokens actuels si connecté */}
        {session && currentUser && (
          <div className="mb-12">
            <TokensDisplay user={currentUser} />
          </div>
        )}

        {/* Grille des plans */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {plans.map((plan, index) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              isCurrentPlan={currentUser?.planId === plan.id}
              isLoggedIn={!!session}
              isPopular={index === 2} // Le plan Argent est populaire
            />
          ))}
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">Questions fréquentes</h2>
          <div className="grid gap-6">
            <div className="bg-[#1c1d1f] rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-3">Comment fonctionnent les tokens GLHF ?</h3>
              <p className="text-gray-300">
                Chaque participation à un tournoi coûte 1 token GLHF. Tes tokens se réinitialisent automatiquement chaque mois 
                et ne s'accumulent pas. Si tu quittes un tournoi avant qu'il ne commence, ton token est remboursé.
              </p>
            </div>
            
            <div className="bg-[#1c1d1f] rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-3">Puis-je changer de forfait à tout moment ?</h3>
              <p className="text-gray-300">
                Oui, tu peux améliorer ton forfait à tout moment. Les changements prennent effet immédiatement et 
                tes tokens sont ajustés selon ton nouveau plan.
              </p>
            </div>
            
            <div className="bg-[#1c1d1f] rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-3">Comment annuler mon abonnement ?</h3>
              <p className="text-gray-300">
                Tu peux annuler ton abonnement à tout moment depuis ton profil. L'accès premium reste actif 
                jusqu'à la fin de la période payée, puis tu passes automatiquement au plan gratuit.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}