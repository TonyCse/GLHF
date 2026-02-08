"use client";

import { useState, useRef, useEffect } from "react";
import { Check, Trophy, X } from "lucide-react";
import Image from "next/image";

type Participant = {
  id: number;
  pseudo: string;
  avatar?: string;
  avatarUrl?: string | null;
  isDeleted?: boolean;
};

type WinnersMap = {
  [roundIndex: number]: { [matchIndex: number]: Participant };
};

type Props = {
  participants: Participant[];
  isCreator?: boolean;
  tournamentId: number;
};

export default function TournamentBracket({ participants, isCreator = false, tournamentId }: Props) {
  const [winners, setWinners] = useState<WinnersMap>({});
  const [, setIsUpdating] = useState(false);
  const isUpdatingRef = useRef(false);
  const updatingCountRef = useRef(0);

  const rounds = Math.ceil(Math.log2(Math.max(participants.length, 2)));
  const totalSlots = Math.pow(2, rounds);
  const paddedParticipants = [...participants];

  while (paddedParticipants.length < totalSlots) {
    paddedParticipants.push({ id: -1 * (paddedParticipants.length + 1), pseudo: "?" });
  }

  const getWinner = (round: number, matchIndex: number): Participant | null => {
    return winners[round]?.[matchIndex] ?? null;
  };

  const startUpdating = () => {
    updatingCountRef.current += 1;
    isUpdatingRef.current = true;
    setIsUpdating(true);
  };

  const stopUpdating = () => {
    updatingCountRef.current = Math.max(0, updatingCountRef.current - 1);
    const isActive = updatingCountRef.current > 0;
    isUpdatingRef.current = isActive;
    setIsUpdating(isActive);
    return isActive;
  };

  const removeWinner = (next: WinnersMap, round: number, matchIndex: number) => {
    if (!next[round]) return;
    const { [matchIndex]: _removed, ...rest } = next[round];
    if (Object.keys(rest).length) {
      next[round] = rest;
    } else {
      delete next[round];
    }
  };

  const clearWinnerPath = (next: WinnersMap, startRound: number, startMatchIndex: number) => {
    let round = startRound + 1;
    let matchIndex = Math.floor(startMatchIndex / 2);

    while (round < rounds) {
      removeWinner(next, round, matchIndex);
      matchIndex = Math.floor(matchIndex / 2);
      round += 1;
    }
  };

  const applyOptimisticSelection = (round: number, matchIndex: number, winner: Participant) => {
    setWinners((current) => {
      const next: WinnersMap = { ...current };
      const roundWinners = { ...(next[round] || {}) };
      roundWinners[matchIndex] = winner;
      next[round] = roundWinners;
      clearWinnerPath(next, round, matchIndex);
      return next;
    });
  };

  const applyOptimisticCancel = (round: number, matchIndex: number) => {
    setWinners((current) => {
      const next: WinnersMap = { ...current };
      removeWinner(next, round, matchIndex);
      clearWinnerPath(next, round, matchIndex);
      return next;
    });
  };

  const fetchWinners = async (force = false) => {
    if (isUpdatingRef.current && !force) return;
    try {
      const res = await fetch(`/api/match/list?tournamentId=${tournamentId}`);
      const data = await res.json();
      if (res.ok && data.matches) {
        const loadedWinners: WinnersMap = {};

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
  }, [tournamentId]); 

  const handleValidateWinner = async (round: number, matchIndex: number, winner: Participant) => {
    try {
      const res = await fetch("/api/match/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tournamentId, round, matchIndex, winnerId: winner.id }),
      });
      const data = await res.json();
      if (res.ok && data?.match?.winner?.id === winner.id) {
        if (round === rounds - 1 && winner?.id) {
          await fetch(`/api/tournament/${tournamentId}/winner`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              winnerId: winner.id,
            }),
          });
        }
        return true;
      }
    } catch (err) {
      console.error("Erreur:", err);
    }
    return false;
  };

  const deleteMatchWinner = async (round: number, matchIndex: number) => {
    return fetch("/api/match/update", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tournamentId, round, matchIndex }),
    });
  };

  const clearTournamentWinner = async () => {
    await fetch(`/api/tournament/${tournamentId}/winner`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        winnerId: null,
      }),
    });
  };

  const clearDownstreamWinners = async (startRound: number, startMatchIndex: number) => {
    const deletes: Promise<Response>[] = [];
    let round = startRound + 1;
    let matchIndex = Math.floor(startMatchIndex / 2);

    while (round < rounds) {
      deletes.push(deleteMatchWinner(round, matchIndex));
      matchIndex = Math.floor(matchIndex / 2);
      round += 1;
    }

    if (deletes.length) {
      await Promise.all(deletes);
    }

    await clearTournamentWinner();
  };

  const handleCancelWinner = async (round: number, matchIndex: number) => {
    startUpdating();
    applyOptimisticCancel(round, matchIndex);
    try {
      const res = await deleteMatchWinner(round, matchIndex);
      if (!res.ok) throw new Error("Annulation impossible");
      if (round < rounds - 1) {
        await clearDownstreamWinners(round, matchIndex);
      } else {
        await clearTournamentWinner();
      }
    } catch (err) {
      console.error("Erreur lors de l'annulation du gagnant:", err);
    } finally {
      const stillUpdating = stopUpdating();
      if (!stillUpdating) {
        fetchWinners(true);
      }
    }
  };

  const handleSelectWinner = async (round: number, matchIndex: number, player: Participant) => {
    const currentWinner = getWinner(round, matchIndex);
    if (currentWinner?.id === player.id) return;

    startUpdating();
    applyOptimisticSelection(round, matchIndex, player);
    try {
      if (currentWinner) {
        const res = await deleteMatchWinner(round, matchIndex);
        if (!res.ok) throw new Error("Impossible de remplacer le gagnant");
      }

      if (round < rounds - 1) {
        await clearDownstreamWinners(round, matchIndex);
      } else if (currentWinner) {
        await clearTournamentWinner();
      }

      const isValid = await handleValidateWinner(round, matchIndex, player);
      if (!isValid) throw new Error("Enregistrement du gagnant impossible");
    } catch (err) {
      console.error("Erreur lors du changement de gagnant:", err);
    } finally {
      const stillUpdating = stopUpdating();
      if (!stillUpdating) {
        fetchWinners(true);
      }
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

  const championObj = getWinner(rounds - 1, 0);
  const hasChampion = championObj && championObj.pseudo !== "?";

  return (
    <div className="flex flex-col gap-4">
      {hasChampion && championObj && (
        <div className="rounded-2xl border border-[#8F60D0]/30 bg-gradient-to-r from-[#1c1d1f] via-[#222327] to-[#1c1d1f] px-5 py-4 shadow-lg">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#8F60D0]/50 bg-[#8F60D0]/15 text-[#DCCEFF]">
                <Trophy className="h-5 w-5" />
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-[0.35em] text-slate-400">Champion du tournoi</div>
                <div className="text-xl font-semibold text-white">{championObj.pseudo}</div>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-full border border-white/10 bg-black/30 px-4 py-2">
              <div className="h-10 w-10 overflow-hidden rounded-full border border-[#8F60D0]/50">
                <Image
                  src={championObj.avatarUrl || championObj.avatar || `https://api.dicebear.com/9.x/lorelei/png?seed=${encodeURIComponent(championObj.pseudo)}`}
                  alt={championObj.pseudo}
                  width={40}
                  height={40}
                  className="object-cover"
                />
              </div>
              <div className="text-sm text-[#DCCEFF]">Gagnant officiel</div>
            </div>
          </div>
        </div>
      )}

      <div className="bracket-scroll relative min-h-[700px] rounded-2xl border border-[#8F60D0]/20 bg-gradient-to-br from-[#1c1d1f] to-[#2a2b2f] p-6 shadow-xl overflow-x-auto overflow-y-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(143,96,208,0.15),_transparent_60%)]" />

        <div className="relative flex items-start justify-center gap-12 min-w-fit py-4" ref={round0Ref}>
          {Array.from({ length: rounds }).map((_, roundIndex) => {
            const matchCount = roundIndex === 0 ? totalSlots / 2 : Math.max(1, totalSlots / Math.pow(2, roundIndex + 1));
            const spacing = Math.pow(2, roundIndex);
            const isFirstRound = roundIndex === 0;
            const matchHeight = roundHeight ? roundHeight / Math.pow(2, roundIndex) : "auto";

            return (
              <div key={roundIndex} className="relative flex flex-col items-center">
                <div className="mb-5">
                  <div className="inline-flex items-center rounded-full border border-[#8F60D0]/40 bg-[#8F60D0]/10 px-4 py-2 text-xs uppercase tracking-[0.25em] text-[#DCCEFF]">
                    {getRoundName(roundIndex, rounds)}
                  </div>
                </div>

                <div className="flex flex-col gap-6" style={{ minHeight: matchHeight }}>
                  {Array.from({ length: matchCount }).map((_, matchIndex) => {
                    const playerIndex = matchIndex * spacing * 2;
                    const playerA = isFirstRound ? paddedParticipants[playerIndex] : getWinner(roundIndex - 1, matchIndex * 2);
                    const playerB = isFirstRound ? paddedParticipants[playerIndex + spacing] : getWinner(roundIndex - 1, matchIndex * 2 + 1);

                    const isAInvalid = !playerA || playerA.pseudo === "?" || playerA.isDeleted;
                    const isBInvalid = !playerB || playerB.pseudo === "?" || playerB.isDeleted;
                    if (isAInvalid && isBInvalid) return null;

                    const winnerObj = getWinner(roundIndex, matchIndex);
                    const winnerExists = !!winnerObj;

                    if (isCreator && !winnerExists && isRoundComplete(roundIndex - 1)) {
                      if (!isAInvalid && isBInvalid) handleSelectWinner(roundIndex, matchIndex, playerA!);
                      if (!isBInvalid && isAInvalid) handleSelectWinner(roundIndex, matchIndex, playerB!);
                    }

                    const renderPlayerRow = (
                      player: Participant | null,
                      isWinner: boolean,
                      isLoser: boolean,
                      isPlaceholder: boolean,
                      qualifiesByDefault: boolean
                    ) => {
                      const isMissing = !!player?.isDeleted;
                      const name = isMissing
                        ? "Utilisateur introuvable"
                        : isPlaceholder
                        ? "En attente..."
                        : player?.pseudo || "Inconnu";

                      const rowTone = isWinner
                        ? "border-[#8F60D0]/60 bg-[#8F60D0]/15 text-white"
                        : isMissing
                        ? "border-rose-500/40 bg-rose-500/10 text-rose-100"
                        : isLoser
                        ? "border-white/10 bg-black/30 text-slate-400"
                        : isPlaceholder
                        ? "border-white/10 bg-white/5 text-slate-400"
                        : "border-white/10 bg-black/20 text-slate-100";

                      const rowAccent = isWinner
                        ? "border-l-4 border-l-[#8F60D0]"
                        : isMissing
                        ? "border-l-4 border-l-rose-500/60"
                        : "border-l-4 border-l-transparent";

                      const avatarStyle = isWinner
                        ? "border-[#8F60D0]/60"
                        : isMissing
                        ? "border-rose-500/50"
                        : "border-white/20";

                      return (
                        <div className={`flex items-center gap-3 rounded-lg border px-3 py-2 ${rowTone} ${rowAccent}`}>
                          <div className={`relative h-9 w-9 overflow-hidden rounded-full border ${avatarStyle}`}>
                            {player && !isPlaceholder && !player.isDeleted ? (
                              <Image
                                src={player.avatarUrl || player.avatar || `https://api.dicebear.com/9.x/lorelei/png?seed=${encodeURIComponent(player.pseudo)}`}
                                alt={player.pseudo}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center bg-black/40 text-slate-400">
                                <span className="text-sm">?</span>
                              </div>
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className={`truncate text-sm font-semibold ${isLoser ? "line-through text-slate-400" : ""}`}>
                              {name}
                            </div>
                            {qualifiesByDefault && <div className="text-[11px] text-slate-400">Auto-qualifie</div>}
                          </div>

                          <div className="flex items-center gap-2">
                            <div
                              className={`min-w-[88px] rounded-full border px-2 py-0.5 text-center text-[10px] uppercase tracking-[0.2em] ${
                                isWinner ? "border-[#8F60D0]/50 text-[#DCCEFF]" : "border-white/10 text-slate-400"
                              }`}
                            >
                              {isWinner ? "Gagnant" : "Qualifie"}
                            </div>

                            {isCreator && !isPlaceholder && player && !player.isDeleted && (
                              <div className="flex items-center gap-1">
                                {(!winnerExists || !isWinner) && (
                                  <button
                                    onClick={() => handleSelectWinner(roundIndex, matchIndex, player)}
                                    className="rounded border border-[#8F60D0]/40 px-1.5 py-1 text-[#DCCEFF] transition hover:border-[#8F60D0] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                                    title={winnerExists ? "Changer le gagnant" : "Designer comme gagnant"}
                                    aria-label={winnerExists ? "Changer le gagnant" : "Designer comme gagnant"}
                                  >
                                    <Check className="h-4 w-4" />
                                  </button>
                                )}
                                {isWinner && (
                                  <button
                                    onClick={() => handleCancelWinner(roundIndex, matchIndex)}
                                    className="rounded border border-rose-500/40 px-1.5 py-1 text-rose-300 transition hover:border-rose-400 hover:text-rose-200 disabled:cursor-not-allowed disabled:opacity-50"
                                    title="Annuler la victoire"
                                    aria-label="Annuler la victoire"
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    };

                    const isWinnerA = winnerObj?.id === playerA?.id;
                    const isWinnerB = winnerObj?.id === playerB?.id;
                    const isPlaceholderA = playerA?.pseudo === "?";
                    const isPlaceholderB = playerB?.pseudo === "?";
                    const isLoserA = winnerExists && !isWinnerA;
                    const isLoserB = winnerExists && !isWinnerB;
                    const qualifiesA = !playerA?.isDeleted && isBInvalid && !isAInvalid;
                    const qualifiesB = !playerB?.isDeleted && isAInvalid && !isBInvalid;

                    return (
                      <div key={matchIndex} className="relative">
                        <div className="rounded-xl border border-white/10 bg-[#8F60D0]/10 p-3">
                          <div className="flex flex-col gap-2">
                            {renderPlayerRow(playerA, isWinnerA, isLoserA, isPlaceholderA, qualifiesA)}
                            <div className="text-center text-[11px] uppercase tracking-[0.3em] text-slate-400">vs</div>
                            {renderPlayerRow(playerB, isWinnerB, isLoserB, isPlaceholderB, qualifiesB)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
