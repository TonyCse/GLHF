"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { PlusCircle, X } from "lucide-react";
import Button from "./Button";
import DeleteTournamentButton from "./DeleteTournamentButton";
import TournamentBracket from "./TournamentBracket";
import TournamentTokensWidget from "./TournamentTokensWidget";

type Participant = {
  id: number;
  pseudo: string;
  avatarUrl?: string | null;
  isDeleted?: boolean;
};

type TokensInfo = {
  remainingTokens: number;
  usedTokens: number;
  totalTokensThisMonth: number;
  plan: string;
};

type CreatorInfo = {
  id: number;
  pseudo: string | null;
  avatarUrl?: string | null;
  isDeleted?: boolean;
};

type Props = {
  tournoiId: number;
  name: string;
  description: string;
  gameLabel: string;
  backgroundImage: string;
  dateIso: string;
  maxPlayers: number;
  winnerId?: number | null;
  createdBy?: CreatorInfo | null;
  initialParticipants: Participant[];
  isCreator: boolean;
  sessionUser?: Participant | null;
  initialTokensInfo?: TokensInfo | null;
  showTokens?: boolean;
};

export default function TournamentDetailClient({
  tournoiId,
  name,
  description,
  gameLabel,
  backgroundImage,
  dateIso,
  maxPlayers,
  winnerId,
  createdBy,
  initialParticipants,
  isCreator,
  sessionUser,
  initialTokensInfo = null,
  showTokens,
}: Props) {
  const [participants, setParticipants] = useState<Participant[]>(initialParticipants);
  const [tokensInfo, setTokensInfo] = useState<TokensInfo | null>(initialTokensInfo);
  const [isJoining, setIsJoining] = useState(false);
  const [leavingIds, setLeavingIds] = useState<Set<number>>(new Set());
  const [feedback, setFeedback] = useState<string | null>(null);

  const sessionUserId = sessionUser?.id;
  const hasSessionUser = Number.isFinite(sessionUserId);
  const isParticipant = hasSessionUser
    ? participants.some((participant) => participant.id === sessionUserId)
    : false;
  const isFull = participants.length >= maxPlayers;
  const tournamentDate = useMemo(() => new Date(dateIso), [dateIso]);
  const tournamentStarted = tournamentDate <= new Date();
  const canJoin = hasSessionUser && !tournamentStarted && !isParticipant && !isFull;

  const dateStr = tournamentDate.toLocaleDateString();
  const timeStr = tournamentDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const refreshTokens = async () => {
    if (!hasSessionUser) return;
    try {
      const response = await fetch("/api/user/tokens", { cache: "no-store" });
      const data = await response.json();
      if (response.ok && data?.success) {
        setTokensInfo(data.data);
      }
    } catch (error) {
      console.error("Erreur lors de la mise a jour des tokens:", error);
    }
  };

  const handleJoin = async () => {
    if (!canJoin || isJoining || !hasSessionUser) return;
    setFeedback(null);
    setIsJoining(true);

    const optimisticParticipant: Participant = {
      id: sessionUserId as number,
      pseudo: sessionUser?.pseudo || "Moi",
      avatarUrl: sessionUser?.avatarUrl ?? null,
      isDeleted: false,
    };

    const wasAlreadyParticipant = participants.some(
      (participant) => participant.id === sessionUserId
    );

    if (!wasAlreadyParticipant) {
      setParticipants((current) => [...current, optimisticParticipant]);
    }

    try {
      const res = await fetch(`/api/tournament/${tournoiId}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "join" }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Erreur lors de l'inscription");
      }

      await refreshTokens();
    } catch (error) {
      if (!wasAlreadyParticipant) {
        setParticipants((current) =>
          current.filter((participant) => participant.id !== sessionUserId)
        );
      }
      setFeedback(error instanceof Error ? error.message : "Erreur lors de l'inscription");
    } finally {
      setIsJoining(false);
    }
  };

  const handleLeave = async (targetUserId: number) => {
    if (leavingIds.has(targetUserId)) return;
    setFeedback(null);
    setLeavingIds((current) => {
      const next = new Set(current);
      next.add(targetUserId);
      return next;
    });

    const previousParticipants = participants;
    setParticipants((current) =>
      current.filter((participant) => participant.id !== targetUserId)
    );

    try {
      const res = await fetch(`/api/tournament/${tournoiId}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "leave",
          userId: targetUserId,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Erreur lors du retrait");
      }

      if (targetUserId === sessionUserId) {
        await refreshTokens();
      }
    } catch (error) {
      setParticipants(previousParticipants);
      setFeedback(error instanceof Error ? error.message : "Erreur lors du retrait");
    } finally {
      setLeavingIds((current) => {
        const next = new Set(current);
        next.delete(targetUserId);
        return next;
      });
    }
  };

  return (
    <>
      {showTokens && (
        <div className="mb-8">
          <TournamentTokensWidget initialTokensInfo={tokensInfo} show={showTokens} />
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8 mb-10">
        <div className="w-full lg:w-[300px] flex-shrink-0">
          <div className="relative w-full aspect-[3/2] rounded-lg border-2 border-[#8F60D0] overflow-hidden shadow-lg">
            <Image
              src={backgroundImage}
              alt={name}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 300px"
            />
          </div>
        </div>

        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-300 text-lg">
          <div>
            <p className="text-white font-semibold text-xl mb-1">Jeu</p>
            <p>{gameLabel}</p>
          </div>
          <div>
            <p className="text-white font-semibold text-xl mb-1">Date</p>
            <p>{dateStr} a {timeStr}</p>
          </div>
          <div>
            <p className="text-white font-semibold text-xl mb-1">Createur</p>
            <p>
              {createdBy?.isDeleted ? "Utilisateur introuvable" : createdBy?.pseudo || "Inconnu"}
            </p>
          </div>
          <div>
            <p className="text-white font-semibold text-xl mb-1">Participants max</p>
            <p>{maxPlayers}</p>
          </div>
          <div className="sm:col-span-2 mt-4">
            <p className="text-white font-semibold text-xl mb-1">Description</p>
            <p className="text-gray-300 line-clamp-2">{description}</p>
            <div className="flex mt-6 items-center gap-6 min-h-[48px]">
              {canJoin && (
                <Button onClick={handleJoin} textSize="text-xl" disabled={isJoining}>
                  <>
                    <PlusCircle size={30} />
                    Rejoindre le tournoi
                  </>
                </Button>
              )}

              {isFull && !isParticipant && !tournamentStarted && (
                <p className="text-red-400 font-semibold text-lg">
                  Le tournoi est complet.
                </p>
              )}

              {tournamentStarted && !isParticipant && (
                <p className="text-yellow-400 font-semibold text-lg">
                  {winnerId ? "Tournoi termine" : "Tournoi en cours"}
                </p>
              )}

              {isCreator && <DeleteTournamentButton id={tournoiId} textSize="text-xl" />}
            </div>
            {feedback && (
              <p className="text-sm text-red-300 mt-3">{feedback}</p>
            )}
          </div>
        </div>
      </div>

      <div className="mb-10">
        <h2 className="text-2xl font-semibold text-[#8F60D0] mb-4">Participants</h2>
        {participants.length === 0 ? (
          <p className="text-gray-400 text-lg">Aucun participant pour le moment.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {participants.map((participant) => {
              const isCurrentUser = hasSessionUser && participant.id === sessionUserId;
              const displayPseudo = participant.isDeleted ? "Utilisateur introuvable" : participant.pseudo;
              const profileLink = participant.isDeleted ? "#" : `/profil/${participant.pseudo}`;
              const canRemove = (isCurrentUser || isCreator) && !participant.isDeleted;
              const isLeaving = leavingIds.has(participant.id);

              return (
                <div
                  key={participant.id}
                  className="relative flex flex-col items-center bg-gradient-to-br from-[#1c1d1f] to-[#2a2b2f] p-8 rounded-xl shadow-xl transition-all duration-300 transform hover:-translate-y-3 hover:shadow-2xl border border-[#8F60D0]/20 hover:border-[#8F60D0]/40"
                >
                  {canRemove && (
                    <button
                      onClick={() => handleLeave(participant.id)}
                      disabled={isLeaving}
                      aria-busy={isLeaving}
                      className="cursor-pointer absolute top-2 right-2 z-10 rounded border border-rose-500/40 bg-black/30 px-1.5 py-1 text-rose-300 transition hover:border-rose-400 hover:text-rose-200 disabled:cursor-not-allowed disabled:opacity-60"
                      title="Exclure du tournoi"
                      aria-label="Quitter le tournoi"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}

                  {participant.isDeleted ? (
                    <div className="flex flex-col items-center">
                      <div className="relative">
                        <Image
                          src={participant.avatarUrl || "/avatars/default.png"}
                          alt="Utilisateur introuvable"
                          width={80}
                          height={80}
                          className="rounded-full border-2 border-gray-500 object-cover"
                        />
                        <div className="absolute inset-0 bg-gray-800 bg-opacity-70 rounded-full"></div>
                      </div>
                      <span className="text-xl text-gray-500 mt-2 text-center">{displayPseudo}</span>
                    </div>
                  ) : (
                    <Link href={profileLink} className="flex flex-col items-center">
                      <Image
                        src={participant.avatarUrl || "/avatars/default.png"}
                        alt={`Joueur ${participant.pseudo}`}
                        width={80}
                        height={80}
                        className="rounded-full border-2 border-[#8F60D0] bg-gradient-to-br from-[#8F60D0] to-[#2e2640] object-cover"
                      />
                      <span className="text-xl text-[#8F60D0] mt-2 text-center">{displayPseudo}</span>
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-2xl font-semibold text-[#8F60D0] mb-4">Arbre du Tournoi</h2>
        <div className="min-h-[600px]">
          <TournamentBracket
            participants={participants}
            isCreator={isCreator}
            tournamentId={tournoiId}
          />
        </div>
      </div>
    </>
  );
}
