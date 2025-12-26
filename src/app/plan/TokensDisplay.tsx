"use client";

import { useEffect, useState } from "react";
import { Clock, Zap } from "lucide-react";

interface User {
  id: number;
  tokensUsedThisMonth: number;
  tokensMonthStart?: Date | null;
  plan?: {
    name: string;
    tokensPerMonth: number;
  } | null;
}

interface TokensDisplayProps {
  user: User;
}

interface TokensInfo {
  remainingTokens: number;
  usedTokens: number;
  totalTokensThisMonth: number;
  plan: string;
  monthStart?: Date;
}

export default function TokensDisplay({ user }: TokensDisplayProps) {
  const [tokensInfo, setTokensInfo] = useState<TokensInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTokensInfo = async () => {
      try {
        const response = await fetch('/api/user/tokens');
        const data = await response.json();
        
        if (data.success) {
          setTokensInfo(data.data);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des tokens:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTokensInfo();
  }, []);

  if (loading) {
    return (
      <div className="bg-[#1c1d1f] rounded-2xl p-6 border border-[#2a2c30]">
        <div className="animate-pulse flex space-x-4">
          <div className="rounded-full bg-gray-600 h-12 w-12"></div>
          <div className="flex-1 space-y-2 py-1">
            <div className="h-4 bg-gray-600 rounded w-3/4"></div>
            <div className="h-4 bg-gray-600 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!tokensInfo) {
    return null;
  }

  const percentageUsed = (tokensInfo.usedTokens / tokensInfo.totalTokensThisMonth) * 100;

  return (
    <div className="bg-[#1c1d1f] rounded-2xl p-6 border border-[#2a2c30] max-w-md mx-auto">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 bg-gradient-to-r from-[#8F60D0] to-[#A855F7] rounded-full flex items-center justify-center">
          <Zap className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">Mes tokens GLHF</h3>
          <p className="text-gray-400">{tokensInfo.plan}</p>
        </div>
      </div>

      {/* Barre de progression */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-400">Tokens utilisés ce mois</span>
          <span className="text-sm font-medium text-white">
            {tokensInfo.usedTokens} / {tokensInfo.totalTokensThisMonth}
          </span>
        </div>
        
        <div className="w-full bg-gray-700 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-[#8F60D0] to-[#A855F7] h-3 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(percentageUsed, 100)}%` }}
          ></div>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#232426] rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-green-400">
            {tokensInfo.remainingTokens}
          </div>
          <div className="text-sm text-gray-400">Restants</div>
        </div>
        
        <div className="bg-[#232426] rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-blue-400">
            {tokensInfo.totalTokensThisMonth}
          </div>
          <div className="text-sm text-gray-400">Par mois</div>
        </div>
      </div>

      {/* Informations sur le reset */}
      {tokensInfo.monthStart && (
        <div className="mt-4 flex items-center gap-2 text-sm text-gray-400">
          <Clock className="w-4 h-4" />
          <span>
            Prochaine recharge: {getNextMonthDate(tokensInfo.monthStart)}
          </span>
        </div>
      )}

      {/* Alert si plus de tokens */}
      {tokensInfo.remainingTokens === 0 && (
        <div className="mt-4 p-3 bg-red-600/10 border border-red-600/30 rounded-lg">
          <p className="text-red-300 text-sm text-center">
            Plus de tokens ce mois-ci ! Upgrade ton plan pour continuer à jouer.
          </p>
        </div>
      )}
    </div>
  );
}

function getNextMonthDate(monthStart: Date): string {
  const nextMonth = new Date(monthStart);
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  
  return nextMonth.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long'
  });
}

