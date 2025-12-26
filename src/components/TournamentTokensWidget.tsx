"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Zap } from "lucide-react";

interface TokensInfo {
  remainingTokens: number;
  usedTokens: number;
  totalTokensThisMonth: number;
  plan: string;
}

export default function TournamentTokensWidget() {
  const { data: session } = useSession();
  const [tokensInfo, setTokensInfo] = useState<TokensInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) {
      setLoading(false);
      return;
    }

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
  }, [session]);

  if (!session) {
    return null;
  }

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-[#8F60D0]/20 to-purple-500/20 rounded-lg p-4 border border-[#8F60D0]/30 animate-pulse">
        <div className="h-4 bg-gray-600 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-gray-600 rounded w-1/2"></div>
      </div>
    );
  }

  if (!tokensInfo) {
    return null;
  }

  const isLowTokens = tokensInfo.remainingTokens <= 1;
  const isOutOfTokens = tokensInfo.remainingTokens === 0;

  return (
    <div className={`bg-gradient-to-r rounded-lg p-4 border transition-all duration-300 ${
      isOutOfTokens 
        ? "from-red-500/20 to-red-600/20 border-red-500/50" 
        : isLowTokens 
          ? "from-orange-500/20 to-yellow-500/20 border-orange-500/50"
          : "from-[#8F60D0]/20 to-purple-500/20 border-[#8F60D0]/30"
    }`}>
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-full ${
          isOutOfTokens 
            ? "bg-red-500" 
            : isLowTokens 
              ? "bg-orange-500"
              : "bg-gradient-to-r from-[#8F60D0] to-purple-500"
        }`}>
          <Zap className="w-4 h-4 text-white" />
        </div>
        
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <span className="text-white font-semibold">Tokens GLHF</span>
            <span className={`font-bold ${
              isOutOfTokens 
                ? "text-red-300" 
                : isLowTokens 
                  ? "text-orange-300"
                  : "text-green-300"
            }`}>
              {tokensInfo.remainingTokens} / {tokensInfo.totalTokensThisMonth}
            </span>
          </div>
          
          <div className="text-sm text-gray-400 mt-1">
            {tokensInfo.plan} • {tokensInfo.usedTokens} utilisé{tokensInfo.usedTokens > 1 ? 's' : ''} ce mois
          </div>

          {isOutOfTokens && (
            <div className="text-xs text-red-300 mt-1">
              Plus de tokens ! <a href="/plan" className="underline hover:text-red-200">Upgrade ton plan</a>
            </div>
          )}
          
          {isLowTokens && !isOutOfTokens && (
            <div className="text-xs text-orange-300 mt-1">
              Attention: {tokensInfo.remainingTokens} token{tokensInfo.remainingTokens > 1 ? 's' : ''} restant{tokensInfo.remainingTokens > 1 ? 's' : ''}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

