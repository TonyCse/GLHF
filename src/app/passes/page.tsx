// src/app/passes/page.tsx
import { prisma } from "../../lib/prisma";
import SubscribeButton from "@/components/SubscribeButton";

export default async function PassesPage() {
  const plans = await prisma.plan.findMany({ orderBy: { priceCents: "asc" } });

  return (
    <main className="min-h-screen px-6 py-16 text-white">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10 text-center">
          <h1 className="text-5xl font-extrabold">GLHF Passes</h1>
          <p className="mt-3 text-gray-300 max-w-2xl mx-auto">
            Choisis le forfait qui correspond à ton rythme de jeu. Chaque token
            permet de t'inscrire à un tournoi.
          </p>
        </header>

        <section className="grid gap-8 md:grid-cols-3">
          {plans.map((plan) => (
            <article
              key={plan.id}
              className={`rounded-2xl p-6 flex flex-col justify-between border transition-shadow duration-300 bg-[#232426] border-[#8F60D0]/20`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-semibold">{plan.name}</h2>
                </div>

                <p className="mt-2 text-gray-400 uppercase tracking-wide text-sm">
                  {plan.tokensPerMonth ?? 0} token{(plan.tokensPerMonth ?? 0) > 1 ? "s" : ""} / mois
                </p>

                <div className="mt-6">
                  <span className="text-4xl font-extrabold">{(plan.priceCents / 100).toFixed(2)}€</span>
                  <span className="text-sm text-gray-400"> / mois</span>
                </div>

                <ul className="mt-6 space-y-3 text-gray-300">
                  <li className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-[#8F60D0] mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{plan.tokensPerMonth ?? 0} inscription(s) / mois</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-[#8F60D0] mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Accès aux tournois publics</span>
                  </li>
                </ul>
              </div>

              <div className="mt-6">
                {/* Composant client gérant la session et la soumission afin que le navigateur suive la redirection */}
                <SubscribeButton planId={plan.id} price={(plan.priceCents / 100).toFixed(2)} />
              </div>
            </article>
          ))}
        </section>

        <footer className="mt-10 text-sm text-gray-400 text-center">
          <p>Les prix sont indiqués en euros. Annulation possible à tout moment.</p>
        </footer>
      </div>
    </main>
  );
}
