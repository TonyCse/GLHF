"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Zap, Clock } from "lucide-react";

interface TokensInfo {
  remainingTokens: number;
  usedTokens: number;
  totalTokensThisMonth: number;
  plan: string;
  monthStart?: string | Date | null;
}

interface TokensWidgetProps {
  className?: string;
  compact?: boolean;
  initialTokensInfo?: TokensInfo | null;
}

// Widget des tokens
export default function TokensWidget({
  className = "",
  compact = false,
  initialTokensInfo = null,
}: TokensWidgetProps) {
  const [tokensInfo, setTokensInfo] = useState<TokensInfo | null>(initialTokensInfo);
  const [loading, setLoading] = useState(!initialTokensInfo);

  useEffect(() => {
    if (initialTokensInfo) {
      setTokensInfo(initialTokensInfo);
      setLoading(false);
      return;
    }

    const fetchTokensInfo = async () => {
      try {
        const response = await fetch("/api/user/tokens", { cache: "no-store" });
        const data = await response.json();

        if (data.success) {
          setTokensInfo(data.data);
        }
      } catch {
        // Erreur silencieuse
      } finally {
        setLoading(false);
      }
    };

    fetchTokensInfo();
  }, [initialTokensInfo]);

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className={`bg-gray-600 rounded-lg ${compact ? "h-16" : "h-24"}`}></div>
      </div>
    );
  }

  if (!tokensInfo) {
    return null;
  }

  const percentageUsed =
    tokensInfo.totalTokensThisMonth > 0
      ? (tokensInfo.usedTokens / tokensInfo.totalTokensThisMonth) * 100
      : 0;

  if (compact) {
    return (
      <div
        className={`bg-linear-to-r from-[#8F60D0]/20 to-purple-500/20 rounded-lg p-3 border border-[#8F60D0]/30 ${className}`}
      >
        <div className="flex items-center gap-2">
          <div className="bg-linear-to-r from-[#8F60D0] to-purple-500 p-1 rounded-full">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1">
            <div className="text-sm text-white">Tokens GLHF</div>
            <div className="text-white font-bold">
              {tokensInfo.remainingTokens} / {tokensInfo.totalTokensThisMonth}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-linear-to-br from-[#1c1d1f] to-[#2a2b2f] rounded-xl p-6 border border-[#8F60D0]/20 ${className}`}
    >
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 bg-linear-to-r from-[#8F60D0] to-purple-500 rounded-full flex items-center justify-center">
          <Zap className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">Mes tokens GLHF</h3>
          <p className="text-white">{tokensInfo.plan}</p>
        </div>
      </div>

      {/* Barre de progression */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-white">Tokens utilisés ce mois</span>
          <span className="text-sm font-medium text-white">
            {tokensInfo.usedTokens} / {tokensInfo.totalTokensThisMonth}
          </span>
        </div>

        <div className="w-full bg-gray-700 rounded-full h-3">
          <div
            className="bg-linear-to-r from-[#8F60D0] to-purple-500 h-3 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(percentageUsed, 100)}%` }}
          ></div>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#232426] rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-green-400">{tokensInfo.remainingTokens}</div>
          <div className="text-sm text-white">Restants</div>
        </div>

        <div className="bg-[#232426] rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-blue-400">{tokensInfo.totalTokensThisMonth}</div>
          <div className="text-sm text-white">Par mois</div>
        </div>
      </div>

      {/* Informations sur le reset */}
      {tokensInfo.monthStart && (
        <div className="mt-4 flex items-center gap-2 text-sm text-white">
          <Clock className="w-4 h-4" />
          <span>Prochaine recharge: {getNextMonthDate(tokensInfo.monthStart)}</span>
        </div>
      )}

      {/* Alerte si plus de tokens */}
      {tokensInfo.remainingTokens === 0 && (
        <div className="mt-4 p-3 bg-red-600/10 border border-red-600/30 rounded-lg">
          <p className="text-red-300 text-sm text-center">
            Plus de tokens ce mois-ci !{" "}
            <Link href="/abonnements" className="underline hover:text-red-200">
              Upgrade ton plan
            </Link>{" "}
            pour continuer à jouer.
          </p>
        </div>
      )}
    </div>
  );
}

// Calcule la date de la prochaine recharge de tokens
function getNextMonthDate(monthStart: string | Date): string {
  const nextMonth = new Date(monthStart);
  nextMonth.setMonth(nextMonth.getMonth() + 1);

  return nextMonth.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
  });
}
