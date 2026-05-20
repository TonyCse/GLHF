"use client";

import { useState } from "react";
import { Check, Crown, Medal, Shield, Sparkles, Star } from "lucide-react";
import { useDialog } from "@/components/DialogProvider";

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

type PlanContent = {
  icon: typeof Sparkles;
  iconClassName: string;
  accentClassName: string;
  benefits: string[];
};

export default function PlanCard({
  plan,
  isCurrentPlan,
  isLoggedIn,
  isPopular = false,
}: PlanCardProps) {
  const [loading, setLoading] = useState(false);
  const { alert } = useDialog();

  const price = plan.priceCents / 100;
  const isFree = plan.priceCents === 0;
  const content = getPlanContent(plan);
  const Icon = content.icon;

  const handleSubscribe = async () => {
    if (!isLoggedIn) {
      window.location.href = "/connexion?callbackUrl=/abonnements";
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

      try {
        const url = new URL(redirectUrl);
        if (!url.hostname.endsWith("paypal.com")) {
          throw new Error("URL de redirection non autorisée");
        }
      } catch {
        throw new Error("URL de redirection invalide");
      }

      window.location.href = redirectUrl;
    } catch {
      await alert({
        title: "Souscription impossible",
        description: "Une erreur est survenue. Veuillez réessayer.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="mb-2 flex min-h-7 flex-wrap items-center justify-center gap-2">
        {isCurrentPlan && (
          <div className="rounded-full border border-green-400/30 bg-green-500/15 px-3 py-1 text-sm font-medium text-green-300">
            Plan actuel
          </div>
        )}
        {isPopular && (
          <div className="inline-flex items-center gap-1 rounded-full bg-linear-to-r from-[#8F60D0] to-[#A855F7] px-3 py-1 text-sm font-medium text-white">
            <Star className="h-4 w-4" />
            Populaire
          </div>
        )}
      </div>

      <div
        className={`flex flex-1 flex-col rounded-2xl border bg-[#1c1d1f] p-6 transition-all duration-300 ${
          isCurrentPlan
            ? "border-green-500"
            : isPopular
              ? "border-[#8F60D0] shadow-lg shadow-[#8F60D0]/15"
              : "border-[#2a2c30] hover:border-[#8F60D0]/40"
        }`}
      >
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
            <p className="mt-1 text-sm text-white">
              {plan.tokensPerMonth} token{plan.tokensPerMonth > 1 ? "s" : ""} / mois
            </p>
          </div>

          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${content.iconClassName}`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>

      <div className="mb-6 px-5 py-6">
        <div className="text-5xl font-black leading-none text-white">{plan.tokensPerMonth}</div>
        <p className="mt-2 text-sm text-white">tokens GLHF chaque mois</p>
      </div>

      <ul className="mb-8 space-y-3">
        {content.benefits.map((benefit) => (
          <li key={benefit} className="flex items-start gap-3">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#A855F7]" />
            <span className="text-sm leading-relaxed text-white">{benefit}</span>
          </li>
        ))}
      </ul>

      <div className="mt-auto">
        <div className="mb-4 text-center text-4xl font-extrabold text-white">
          {isFree ? (
            "Gratuit"
          ) : (
            <>
              {price.toFixed(2)}€
              <span className="ml-1 text-lg font-normal text-white">/mois</span>
            </>
          )}
        </div>

        <button
          onClick={handleSubscribe}
          disabled={loading || isCurrentPlan}
          className={`btn-neon w-full rounded-lg px-6 py-3 font-semibold transition-all duration-300 ${
            isCurrentPlan
              ? "cursor-default bg-green-600 text-white"
              : isPopular
                ? "bg-linear-to-r from-[#8F60D0] to-[#A855F7] text-white"
                : "border border-[#2a2c30] bg-[#2a2c30] text-white hover:border-[#8F60D0] hover:bg-[#8F60D0]"
          } ${loading ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
        >
          {loading
            ? "Traitement..."
            : isCurrentPlan
              ? "Vous utilisez ce plan"
              : !isLoggedIn
                ? "Se connecter pour choisir"
                : isFree
                  ? "Passer au plan gratuit"
                  : "Choisir ce plan"}
        </button>
      </div>
      </div>
    </div>
  );
}

function getPlanContent(plan: Plan): PlanContent {
  const isFree = plan.priceCents === 0;

  if (isFree) {
    return {
      icon: Sparkles,
      iconClassName: "bg-gray-600",
      accentClassName: "border-white/10 bg-[#232426]",
      benefits: [
        "Découvrir GLHF sans engagement",
        "Participer à tes premiers tournois",
      ],
    };
  }

  if (plan.tokensPerMonth <= 5) {
    return {
      icon: Shield,
      iconClassName: "bg-amber-600",
      accentClassName: "border-amber-500/20 bg-amber-500/10",
      benefits: [
        "Plus de marge pour jouer régulièrement",
        "Idéal pour un rythme casual à actif",
        "Budget léger",
      ],
    };
  }

  if (plan.tokensPerMonth <= 8) {
    return {
      icon: Medal,
      iconClassName: "bg-slate-400",
      accentClassName: "border-slate-300/20 bg-slate-300/10",
      benefits: [
        "Bon volume pour jouer souvent",
        "Meilleur équilibre confort / prix",
        "Pensé pour les joueurs réguliers",
      ],
    };
  }

  return {
    icon: Crown,
    iconClassName: "bg-yellow-500",
    accentClassName: "border-[#8F60D0]/25 bg-linear-to-br from-[#8F60D0]/20 to-[#A855F7]/10",
    benefits: [
      "Très gros volume de tokens",
      "Confort maximal toute la saison",
      "Parfait pour les profils intensifs",
    ],
  };
}
