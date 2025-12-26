"use client";

import { useState, useRef, useEffect } from "react";
import { Check, Crown, Trophy, Zap, X, Award } from "lucide-react";
import Image from "next/image";

type Participant = {
  id: number;
  pseudo: string;
  avatar?: string;
  isDeleted?: boolean;
};

type Props = {
  participants: Participant[];
  isCreator?: boolean;
  tournamentId: number;
};

export default function TournamentBracket({ participants, isCreator = false, tournamentId }: Props) {
  const [winners, setWinners] = useState<{ [roundIndex: number]: { [matchIndex: number]: Participant } }>({});

  const rounds = Math.ceil(Math.log2(Math.max(participants.length, 2)));
  const totalSlots = Math.pow(2, rounds);
  const paddedParticipants = [...participants];

  while (paddedParticipants.length < totalSlots) {
    paddedParticipants.push({ id: -1 * (paddedParticipants.length + 1), pseudo: "?" });
  }

  const getWinner = (round: number, matchIndex: number): Participant | null => {
    return winners[round]?.[matchIndex] ?? null;
  };

  const fetchWinners = async () => {
    try {
      const res = await fetch(`/api/match/list?tournamentId=${tournamentId}`);
      const data = await res.json();
      if (res.ok && data.matches) {
        const loadedWinners: { [round: number]: { [index: number]: Participant } } = {};

        data.matches.forEach((match: { round: number; matchIndex: number; winner?: Participant }) => {
          const winner = match.winner;
          if (winner && winner.id && winner.pseudo) {
            if (!loadedWinners[match.round]) loadedWinners[match.round] = {};
            loadedWinners[match.round][match.matchIndex] = winner;
          }
        });

        setWinners(loadedWinners);
      }
    } catch (err) {
      console.error("Erreur lors du chargement des gagnants:", err);
    }
  };

  useEffect(() => {
    fetchWinners();
    const interval = setInterval(fetchWinners, 5000);
    return () => clearInterval(interval);
  }, [tournamentId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleValidateWinner = async (round: number, matchIndex: number, winner: Participant) => {
    try {
      const res = await fetch("/api/match/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tournamentId, round, matchIndex, winnerId: winner.id }),
      });
      const data = await res.json();
      if (res.ok && data?.match?.winner?.id === winner.id) {
        fetchWinners();

        // ✅ Mise à jour du champ winnerId dans Tournament si c'est la finale
        if (round === rounds - 1 && winner?.id) {
          await fetch(`/api/tournament/${tournamentId}/winner`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              winnerId: winner.id,
            }),
          });
        }
      }
    } catch (err) {
      console.error("Erreur:", err);
    }
  };

  const handleCancelWinner = async (round: number, matchIndex: number) => {
    try {
      const res = await fetch("/api/match/update", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tournamentId, round, matchIndex }),
      });
      if (res.ok) {
        fetchWinners();

        // ✅ Suppression du winnerId dans Tournament si c'était la finale
        if (round === rounds - 1) {
          await fetch(`/api/tournament/${tournamentId}/winner`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              winnerId: null,
            }),
          });
        }
      }
    } catch (err) {
      console.error("Erreur lors de l'annulation du gagnant:", err);
    }
  };

  const getRoundName = (roundIndex: number, totalRounds: number) => {
    const diff = totalRounds - roundIndex;
    if (diff === 1) return "Finale";
    if (diff === 2) return "Demi-finale";
    if (diff === 3) return "Quart de finale";
    return `${roundIndex + 1}e tour`;
  };

  const isRoundComplete = (roundIndex: number) => {
    const matchCount = Math.max(1, totalSlots / Math.pow(2, roundIndex + 1));
    const matches = winners[roundIndex];
    return matches && Object.keys(matches).length === matchCount;
  };

  const round0Ref = useRef<HTMLDivElement | null>(null);
  const [roundHeight, setRoundHeight] = useState<number | null>(null);

  useEffect(() => {
    if (round0Ref.current) setRoundHeight(round0Ref.current.clientHeight);
  }, [participants]);

  return (
    <div className="relative min-h-[700px] bg-gradient-to-br from-[#0a0b0d] via-[#1a1c1f] to-[#2a1a3a] rounded-3xl p-8 overflow-x-auto overflow-y-hidden border border-[#8F60D0]/20 shadow-2xl">
      
      {/* Fond avec effets visuels premium */}
      <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(143,96,208,0.03)_50%,transparent_75%)] bg-[length:20px_20px] animate-pulse" />
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#8F60D0]/5 to-transparent opacity-50" />
      
      {/* Particules décoratives */}
      <div className="absolute top-4 left-8 w-2 h-2 bg-[#8F60D0] rounded-full animate-ping" />
      <div className="absolute top-12 right-12 w-1 h-1 bg-purple-400 rounded-full animate-ping" style={{ animationDelay: '0.5s' }} />
      <div className="absolute bottom-8 left-16 w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping" style={{ animationDelay: '1s' }} />
      <div className="absolute bottom-16 right-8 w-1 h-1 bg-yellow-400 rounded-full animate-ping" style={{ animationDelay: '1.5s' }} />

      <div className="relative flex items-start justify-center gap-16 min-w-fit py-8" ref={round0Ref}>
        {Array.from({ length: rounds }).map((_, roundIndex) => {
          const matchCount = roundIndex === 0 ? totalSlots / 2 : Math.max(1, totalSlots / Math.pow(2, roundIndex + 1));
          const spacing = Math.pow(2, roundIndex);
          const isFirstRound = roundIndex === 0;
          const isSecondRound = roundIndex === 1;
          const isFinalRound = roundIndex === rounds - 1;
          const matchHeight = roundHeight ? roundHeight / Math.pow(2, roundIndex) : 'auto';

          return (
            <div key={roundIndex} className="relative flex flex-col items-center">
              
              {/* Header du round avec style premium */}
              <div className="mb-8 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-[#8F60D0] to-purple-500 rounded-full blur-lg opacity-30 animate-pulse" />
                <div className="relative bg-gradient-to-r from-[#8F60D0] to-purple-500 p-[2px] rounded-full">
                  <div className="bg-gradient-to-r from-[#1a1c1f] to-[#2a1a3a] px-6 py-3 rounded-full">
                    <h3 className="text-transparent bg-gradient-to-r from-white via-purple-200 to-[#8F60D0] bg-clip-text font-bold text-lg tracking-wider uppercase">
                      {getRoundName(roundIndex, rounds)}
                    </h3>
                  </div>
                </div>
                {isFinalRound && (
                  <div className="absolute -top-2 -right-2">
                    <Crown className="w-8 h-8 text-yellow-400 animate-bounce" />
                  </div>
                )}
              </div>

              {/* Matches */}
              <div className="flex flex-col gap-8" style={{ minHeight: matchHeight }}>
                {Array.from({ length: matchCount }).map((_, matchIndex) => {
                  const playerIndex = matchIndex * spacing * 2;
                  const playerA = isFirstRound ? paddedParticipants[playerIndex] : getWinner(roundIndex - 1, matchIndex * 2);
                  const playerB = isFirstRound ? paddedParticipants[playerIndex + spacing] : getWinner(roundIndex - 1, matchIndex * 2 + 1);

                  const isAInvalid = !playerA || playerA.pseudo === "?" || playerA.isDeleted;
                  const isBInvalid = !playerB || playerB.pseudo === "?" || playerB.isDeleted;
                  if (isAInvalid && isBInvalid) return null;

                  const winnerObj = getWinner(roundIndex, matchIndex);
                  const winnerExists = !!winnerObj;

                  // Auto-qualification
                  if (isCreator && !winnerExists && isRoundComplete(roundIndex - 1)) {
                    if (!isAInvalid && isBInvalid) handleValidateWinner(roundIndex, matchIndex, playerA!);
                    if (!isBInvalid && isAInvalid) handleValidateWinner(roundIndex, matchIndex, playerB!);
                  }

                  return (
                    <div key={matchIndex} className="relative">
                      
                      {/* Match Container Premium */}
                      <div className="relative bg-gradient-to-r from-[#1c1d1f]/90 to-[#2a2b2f]/90 p-[2px] rounded-2xl shadow-2xl backdrop-blur-sm border border-[#8F60D0]/20 hover:border-[#8F60D0]/40 transition-all duration-500">
                        
                        {/* Glow effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-[#8F60D0]/10 to-purple-500/10 rounded-2xl blur-sm opacity-0 hover:opacity-100 transition-opacity duration-500" />
                        
                        <div className="relative bg-gradient-to-br from-[#1a1c1f] via-[#1c1d1f] to-[#2a1a3a] rounded-2xl p-4 space-y-3">
                          
                          {/* VS Badge */}
                          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
                            <div className="bg-gradient-to-r from-[#8F60D0] to-purple-500 p-2 rounded-full border-2 border-white/20">
                              <span className="text-white font-bold text-xs">VS</span>
                            </div>
                          </div>

                          {/* Players */}
                          {[playerA, playerB].map((player, playerIndex) => {
                            const isWinner = winnerObj?.id === player?.id;
                            const isPlaceholder = player?.pseudo === "?";
                            const isLoser = winnerExists && !isWinner;
                            const qualifiesByDefault = !player?.isDeleted && 
                              ((playerA?.pseudo === "?" && player === playerB) || 
                               (playerB?.pseudo === "?" && player === playerA));

                            return (
                              <div
                                key={playerIndex}
                                className={`relative p-4 rounded-xl transition-all duration-500 ${
                                  isWinner 
                                    ? "bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-2 border-green-400/50 shadow-lg shadow-green-400/20" 
                                    : isLoser
                                    ? "bg-gradient-to-r from-gray-800/50 to-gray-700/50 opacity-60 border border-gray-600/30"
                                    : isPlaceholder
                                    ? "bg-gradient-to-r from-gray-600/30 to-gray-700/30 border border-gray-500/30"
                                    : "bg-gradient-to-r from-[#8F60D0]/20 to-purple-500/20 border border-[#8F60D0]/30 hover:border-[#8F60D0]/50"
                                }`}
                              >
                                
                                {/* Winner Crown */}
                                {isWinner && (
                                  <div className="absolute -top-3 -right-3 bg-gradient-to-r from-yellow-400 to-orange-500 p-2 rounded-full animate-bounce shadow-lg">
                                    <Crown className="w-4 h-4 text-white" />
                                  </div>
                                )}

                                <div className="flex items-center gap-3">
                                  
                                  {/* Avatar */}
                                  <div className={`relative w-12 h-12 rounded-full overflow-hidden border-2 ${
                                    isWinner ? "border-green-400" : isLoser ? "border-gray-500" : "border-[#8F60D0]"
                                  } ${isLoser ? "grayscale" : ""} transition-all duration-300`}>
                                    {player && !isPlaceholder && !player.isDeleted ? (
                                      <Image
                                        src={player.avatar || `https://api.dicebear.com/9.x/lorelei/png?seed=${encodeURIComponent(player.pseudo)}`}
                                        alt={player.pseudo}
                                        fill
                                        className="object-cover"
                                      />
                                    ) : (
                                      <div className="w-full h-full bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center">
                                        <span className="text-2xl">?</span>
                                      </div>
                                    )}
                                    
                                    {/* Status overlay */}
                                    {isLoser && (
                                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                        <X className="w-6 h-6 text-red-400" />
                                      </div>
                                    )}
                                  </div>

                                  {/* Player Info */}
                                  <div className="flex-1 min-w-0">
                                    <div className={`font-semibold truncate ${
                                      isWinner ? "text-green-300" :
                                      isLoser ? "text-gray-400" :
                                      isPlaceholder ? "text-gray-500" :
                                      player?.isDeleted ? "text-red-400" :
                                      "text-white"
                                    }`}>
                                      {player?.isDeleted ? "Utilisateur introuvable" : 
                                       isPlaceholder ? "En attente..." : 
                                       player?.pseudo || "Inconnu"}
                                    </div>
                                    
                                    {qualifiesByDefault && (
                                      <div className="text-xs text-cyan-400 flex items-center gap-1 mt-1">
                                        <Zap className="w-3 h-3" />
                                        Qualifié automatiquement
                                      </div>
                                    )}
                                  </div>

                                  {/* Winner badge */}
                                  {isWinner && (
                                    <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-2 py-1 rounded-full">
                                      <span className="text-white text-xs font-bold">WINNER</span>
                                    </div>
                                  )}
                                </div>

                                {/* Admin Controls */}
                                {isCreator && !isPlaceholder && player && !player.isDeleted && (
                                  <div className="absolute top-2 right-2 flex gap-1">
                                    {!winnerExists && (
                                      <button
                                        onClick={() => handleValidateWinner(roundIndex, matchIndex, player)}
                                        className="bg-green-500/80 hover:bg-green-500 p-2 rounded-full transition-all duration-200 shadow-lg hover:shadow-green-500/20"
                                        title="Désigner comme gagnant"
                                      >
                                        <Check className="w-4 h-4 text-white" />
                                      </button>
                                    )}
                                    {isWinner && (
                                      <button
                                        onClick={() => handleCancelWinner(roundIndex, matchIndex)}
                                        className="bg-red-500/80 hover:bg-red-500 p-2 rounded-full transition-all duration-200 shadow-lg hover:shadow-red-500/20"
                                        title="Annuler la victoire"
                                      >
                                        <X className="w-4 h-4 text-white" />
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Connection Line to Next Round */}
                      {roundIndex < rounds - 1 && winnerExists && (
                        <div className="absolute top-1/2 -right-8 w-16 h-0.5 bg-gradient-to-r from-[#8F60D0] to-purple-500 transform -translate-y-1/2">
                          <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-[#8F60D0] rounded-full animate-pulse" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Championship Winner Display */}
      {(() => {
        const championObj = getWinner(rounds - 1, 0);
        if (championObj && championObj.pseudo !== "?") {
          return (
            <div className="absolute top-8 right-8 max-w-sm">
              <div className="relative p-6 bg-gradient-to-r from-[#8F60D0]/20 via-purple-500/20 to-yellow-500/20 rounded-3xl border-2 border-yellow-400/50 shadow-2xl backdrop-blur-sm">
                
                {/* Crown Animation */}
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 p-4 rounded-full border-4 border-white/20 animate-bounce shadow-2xl">
                    <Trophy className="w-8 h-8 text-white" />
                  </div>
                </div>

                {/* Glow Effects */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#8F60D0]/30 via-purple-500/30 to-yellow-500/30 rounded-3xl blur-xl opacity-60 animate-pulse" />
                
                <div className="relative text-center pt-8">
                  <div className="text-transparent bg-gradient-to-r from-yellow-300 via-yellow-400 to-orange-500 bg-clip-text font-black text-xl mb-2">
                    CHAMPION DU TOURNOI
                  </div>
                  
                  <div className="flex items-center justify-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-yellow-400">
                      <Image
                        src={championObj.avatar || `https://api.dicebear.com/9.x/lorelei/png?seed=${encodeURIComponent(championObj.pseudo)}`}
                        alt={championObj.pseudo}
                        width={64}
                        height={64}
                        className="object-cover"
                      />
                    </div>
                  </div>
                  
                  <div className="text-2xl font-bold text-transparent bg-gradient-to-r from-white via-yellow-200 to-[#8F60D0] bg-clip-text mb-3">
                    {championObj.pseudo}
                  </div>
                  
                  <div className="flex justify-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Award
                        key={i}
                        className="w-5 h-5 text-yellow-400 animate-pulse"
                        style={{ animationDelay: `${i * 0.1}s` }}
                        fill="currentColor"
                      />
                    ))}
                  </div>

                  {/* Confetti Effect */}
                  <div className="absolute top-4 left-4 w-2 h-2 bg-yellow-400 rounded-full animate-ping" />
                  <div className="absolute top-8 right-6 w-1 h-1 bg-purple-400 rounded-full animate-ping" style={{ animationDelay: '0.2s' }} />
                  <div className="absolute bottom-8 left-6 w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping" style={{ animationDelay: '0.4s' }} />
                  <div className="absolute bottom-4 right-4 w-1 h-1 bg-orange-400 rounded-full animate-ping" style={{ animationDelay: '0.6s' }} />
                </div>
              </div>
            </div>
          );
        }
        return null;
      })()}
    </div>
  );
}