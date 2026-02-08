"use client";

import { useState } from "react";
import { Check, Crown, Medal, Shield, Sparkles, Star } from "lucide-react";

interface Plan {
  id: number;
  name: string;
  slug: string;
  priceCents: number;
  currency: string;
  tokensPerMonth: number;
}

interface PlanCardProps {
  plan: Plan;
  isCurrentPlan: boolean;
  isLoggedIn: boolean;
  isPopular?: boolean;
}

export default function PlanCard({
  plan,
  isCurrentPlan,
  isLoggedIn,
  isPopular = false,
}: PlanCardProps) {
  const [loading, setLoading] = useState(false);

  const features = getFeaturesList(plan.tokensPerMonth);
  const price = plan.priceCents / 100;
  const isFree = plan.priceCents === 0;

  const handleSubscribe = async () => {
    if (!isLoggedIn) {
      window.location.href = "/signin?callbackUrl=/abonnements";
      return;
    }

    if (isCurrentPlan) return;

    setLoading(true);

    try {
      const res = await fetch("/api/payment/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: plan.id }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Erreur lors de la souscription");
      }

      const data = await res.json();
      const redirectUrl = data.approvalUrl || data.redirectUrl;
      if (!redirectUrl) {
        throw new Error("Redirection manquante");
      }

      window.location.href = redirectUrl;
    } catch (error) {
      console.error("Erreur souscription:", error);
      alert("Une erreur est survenue. Veuillez reessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`relative bg-[#1c1d1f] rounded-2xl p-6 border-2 transition-all duration-300 hover:scale-105 ${
        isPopular
          ? "border-[#8F60D0] shadow-lg shadow-[#8F60D0]/20"
          : isCurrentPlan
          ? "border-green-500"
          : "border-[#2a2c30] hover:border-[#8F60D0]/50"
      }`}
    >
      {isPopular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <div className="bg-gradient-to-r from-[#8F60D0] to-[#A855F7] text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
            <Star className="w-4 h-4" />
            Populaire
          </div>
        </div>
      )}

      {isCurrentPlan && (
        <div className="absolute -top-3 right-4">
          <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
            Plan actuel
          </div>
        </div>
      )}

      <div className="text-center mb-6">
        <div className="flex justify-center mb-3">
          {isFree ? (
            <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
          ) : plan.tokensPerMonth <= 5 ? (
            <div className="w-12 h-12 bg-amber-600 rounded-full flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
          ) : plan.tokensPerMonth <= 8 ? (
            <div className="w-12 h-12 bg-gray-400 rounded-full flex items-center justify-center">
              <Medal className="w-6 h-6 text-white" />
            </div>
          ) : (
            <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center">
              <Crown className="w-6 h-6" />
            </div>
          )}
        </div>

        <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>

        <div className="text-4xl font-extrabold text-white mb-1">
          {isFree ? (
            "Gratuit"
          ) : (
            <>
              {price.toFixed(2)}&euro;
              <span className="text-lg text-gray-400 font-normal">/mois</span>
            </>
          )}
        </div>

        <p className="text-gray-400">
          {plan.tokensPerMonth} token{plan.tokensPerMonth > 1 ? "s" : ""} GLHF par mois
        </p>
      </div>

      <ul className="space-y-3 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-2">
            <Check className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
            <span className="text-gray-300">{feature}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={handleSubscribe}
        disabled={loading || isCurrentPlan}
        className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-300 cursor-pointer ${
          isCurrentPlan
            ? "bg-green-600 text-white cursor-default"
            : isPopular
            ? "bg-gradient-to-r from-[#8F60D0] to-[#A855F7] text-white hover:from-[#A855F7] hover:to-[#8F60D0]"
            : "bg-[#2a2c30] text-white hover:bg-[#8F60D0] border border-[#2a2c30] hover:border-[#8F60D0]"
        } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        {loading
          ? "Traitement..."
          : isCurrentPlan
          ? "Plan actuel"
          : !isLoggedIn
          ? "Se connecter pour souscrire"
          : isFree
          ? "Passer au plan gratuit"
          : "Choisir ce plan"}
      </button>
    </div>
  );
}

function getFeaturesList(tokensPerMonth: number): string[] {
  const baseFeatures = [
    `${tokensPerMonth} tokens GLHF par mois`,
    "Participation aux tournois",
    "Systeme de ranking",
    "Profil personnalise",
  ];

  if (tokensPerMonth > 3) {
    baseFeatures.push("Support prioritaire");
  }

  if (tokensPerMonth >= 8) {
    baseFeatures.push("Badge premium");
    baseFeatures.push("Statistiques avancees");
  }

  if (tokensPerMonth >= 30) {
    baseFeatures.push("Creation de tournois prives");
    baseFeatures.push("Acces aux tournois exclusifs");
    baseFeatures.push("Support dedie");
  }

  return baseFeatures;
}
