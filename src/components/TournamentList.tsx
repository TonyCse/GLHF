"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Calendar, Trophy, User, Users } from "lucide-react";
import TokensWidget from "./TokensWidget";
interface Participant {
  id: number;
  pseudo: string;
  email?: string;
  avatarUrl?: string | null;
}

interface Tournament {
  id: number;
  name: string;
  description?: string;
  maxPlayers: number;
  date: string;
  game: string;
  participantsCount?: number;
  winner?: Participant;
  participants?: Participant[];
  createdAt: string;
  createdBy?: {
    pseudo: string;
  };
}

interface TokensInfo {
  remainingTokens: number;
  usedTokens: number;
  totalTokensThisMonth: number;
  plan: string;
  monthStart?: string | Date | null;
}

type TournamentStatus = "RECRUITING" | "FULL" | "IN_PROGRESS" | "FINISHED";

type TournamentView = Tournament & {
  status: TournamentStatus;
  participantsCount: number;
  dateStr: string;
  timeStr: string;
  progress: number;
};

const GAME_LABELS: Record<string, string> = {
  LEAGUE_OF_LEGENDS: "League of Legends",
  VALORANT: "Valorant",
  OVERWATCH: "Overwatch",
  FALL_GUYS: "Fall Guys",
  MARVELS_RIVALS: "Marvel's Rivals",
  MINECRAFT: "Minecraft",
};

const getBackgroundImage = (game: string) => {
  const map: Record<string, string> = {
    LEAGUE_OF_LEGENDS: "/images/lol_bg.webp",
    VALORANT: "/images/valorant_bg.webp",
    OVERWATCH: "/images/ow_bg.webp",
    FALL_GUYS: "/images/fg_bg.webp",
    MARVELS_RIVALS: "/images/marvel_bg.webp",
    MINECRAFT: "/images/minecraft_bg.webp",
  };
  return map[game] || "/images/default.svg";
};

const STATUS_LABELS: Record<TournamentStatus, string> = {
  RECRUITING: "Recrutement",
  FULL: "Complet",
  IN_PROGRESS: "En cours",
  FINISHED: "Terminé",
};

const STATUS_DOT: Record<TournamentStatus, string> = {
  RECRUITING: "bg-[#8F60D0]",
  FULL: "bg-amber-400",
  IN_PROGRESS: "bg-sky-400",
  FINISHED: "bg-red-500",
};

const STATUS_ORDER: Record<TournamentStatus, number> = {
  RECRUITING: 0,
  FULL: 1,
  IN_PROGRESS: 2,
  FINISHED: 3,
};

const DATE_FORMATTER = new Intl.DateTimeFormat("fr-FR", { timeZone: "Europe/Paris" });
const TIME_FORMATTER = new Intl.DateTimeFormat("fr-FR", {
  timeZone: "Europe/Paris",
  hour: "2-digit",
  minute: "2-digit",
});

const getStatus = (tournoi: Tournament): TournamentStatus => {
  const participantsCount = tournoi.participantsCount ?? tournoi.participants?.length ?? 0;
  const isFull = participantsCount >= tournoi.maxPlayers;
  const isFinished = !!tournoi.winner;
  const tournamentStarted = new Date(tournoi.date) <= new Date();

  if (isFinished) return "FINISHED";
  if (!isFull) return "RECRUITING";
  if (tournamentStarted) return "IN_PROGRESS";
  return "FULL";
};

type TournamentListProps = {
  initialTournois?: Tournament[];
  showTokensWidget?: boolean;
  initialTokensInfo?: TokensInfo | null;
};

export default function TournamentList({
  initialTournois,
  showTokensWidget = false,
  initialTokensInfo = null,
}: TournamentListProps) {
  const [tournois, setTournois] = useState<Tournament[]>(() => {
    if (!initialTournois) return [];
    return [...initialTournois].sort((a, b) => {
      return STATUS_ORDER[getStatus(a)] - STATUS_ORDER[getStatus(b)];
    });
  });
  const [loading, setLoading] = useState(initialTournois === undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const [gameFilter, setGameFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const itemsPerPage = 10;
  const hasActiveFilters = gameFilter !== "ALL" || statusFilter !== "ALL";

  const searchParams = useSearchParams();
  const gameFromURL = searchParams.get("game");

  useEffect(() => {
    if (gameFromURL && gameFilter === "ALL") {
      setGameFilter(gameFromURL);
    }
  }, [gameFromURL, gameFilter]);

  useEffect(() => {
    if (initialTournois !== undefined) {
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    const fetchTournois = async () => {
      try {
        const res = await fetch("/api/tournament/list", { signal: controller.signal });
        const data = await res.json();

        const sorted: Tournament[] = [...data].sort((a: Tournament, b: Tournament) => {
          return STATUS_ORDER[getStatus(a)] - STATUS_ORDER[getStatus(b)];
        });

        setTournois(sorted);
      } catch {
        // Erreur silencieuse
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };
    fetchTournois();

    return () => controller.abort();
  }, [initialTournois]);

  const derivedTournois = useMemo<TournamentView[]>(
    () =>
      tournois.map((tournoi) => {
        const participantsCount = tournoi.participantsCount ?? tournoi.participants?.length ?? 0;
        const maxPlayers = Math.max(tournoi.maxPlayers, 1);
        const progress = Math.min((participantsCount / maxPlayers) * 100, 100);
        const dateObj = new Date(tournoi.date);
        const dateStr = DATE_FORMATTER.format(dateObj);
        const timeStr = TIME_FORMATTER.format(dateObj);

        return {
          ...tournoi,
          status: getStatus(tournoi),
          participantsCount,
          dateStr,
          timeStr,
          progress,
        };
      }),
    [tournois],
  );

  const filteredTournois = useMemo(
    () =>
      derivedTournois
        .filter((t) => {
          if (gameFilter === "ALL") return true;
          return t.game === gameFilter;
        })
        .filter((t) => {
          if (statusFilter === "ALL") return true;
          return t.status === statusFilter;
        }),
    [derivedTournois, gameFilter, statusFilter],
  );

  const totalPages = Math.ceil(filteredTournois.length / itemsPerPage);
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentTournois = useMemo(
    () => filteredTournois.slice(indexOfFirst, indexOfLast),
    [filteredTournois, indexOfFirst, indexOfLast],
  );

  if (loading) {
    return <p className="text-center text-white text-lg">Chargement...</p>;
  }

  return (
    <div className="py-8 sm:py-10 bg-[#232426] text-white flex flex-col items-center px-4 sm:px-6">
      <div className="w-full max-w-6xl bg-[#1c1d1f] p-5 sm:p-8 rounded-xl shadow-xl border border-[#2a2c30]">
        <h1 className="text-3xl sm:text-3xl md:text-4xl font-bold text-white mb-8 text-center">
          Liste des tournois
        </h1>

        {showTokensWidget && (
          <div className="mb-8">
            <TokensWidget
              compact
              className="max-w-md mx-auto"
              initialTokensInfo={initialTokensInfo}
            />
          </div>
        )}

        <div className="flex w-full flex-wrap justify-center gap-4 mb-8">
          <div className="flex flex-col w-full sm:w-auto">
            <label htmlFor="game-filter" className="sr-only">
              Filtrer par jeu
            </label>
            <select
              id="game-filter"
              value={gameFilter}
              onChange={(e) => {
                setGameFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full sm:min-w-[220px] bg-[#232426] text-white px-4 py-2 rounded-lg border border-[#2a2c30] hover:border-[#8F60D0]/50 transition cursor-pointer"
            >
              <option value="ALL">Tous les jeux</option>
              {Object.entries(GAME_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col w-full sm:w-auto">
            <label htmlFor="status-filter" className="sr-only">
              Filtrer par statut
            </label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full sm:min-w-[220px] bg-[#232426] text-white px-4 py-2 rounded-lg border border-[#2a2c30] hover:border-[#8F60D0]/50 transition cursor-pointer"
            >
              <option value="ALL">Tous les statuts</option>
              <option value="RECRUITING">Phase de recrutement</option>
              <option value="FULL">Tournois complets</option>
              <option value="IN_PROGRESS">Tournois en cours</option>
              <option value="FINISHED">Tournois terminés</option>
            </select>
          </div>
        </div>

        {filteredTournois.length === 0 ? (
          <div className="flex flex-col items-center gap-4 text-center text-white text-lg">
            <p>Aucun tournoi trouvé.</p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={() => {
                  setGameFilter("ALL");
                  setStatusFilter("ALL");
                  setCurrentPage(1);
                }}
                className="rounded-lg border border-[#2a2c30] px-4 py-2 text-sm text-white transition hover:border-[#8F60D0] hover:text-[#8F60D0]"
              >
                Supprimer les filtres
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {currentTournois.map((tournoi, index) => {
                const status = tournoi.status;
                const participantsCount = tournoi.participantsCount;
                const progress = tournoi.progress;
                const dateStr = tournoi.dateStr;
                const timeStr = tournoi.timeStr;
                const isLcpCandidate = index === 0;

                return (
                  <Link
                    key={tournoi.id}
                    href={`/tournois/${tournoi.id}`}
                    className="relative block overflow-hidden rounded-2xl border border-[#2a2c30] bg-[#1c1d1f] shadow-lg transition hover:border-[#8F60D0]/50 focus:outline-none focus:ring-2 focus:ring-[#8F60D0] focus:ring-offset-2 focus:ring-offset-[#232426]"
                  >
                    <Image
                      src={getBackgroundImage(tournoi.game)}
                      alt={`Visuel ${GAME_LABELS[tournoi.game] || tournoi.game}`}
                      fill
                      sizes="(max-width: 768px) 100vw, 900px"
                      priority={isLcpCandidate}
                      className={`absolute inset-0 object-cover ${
                        status === "FINISHED" ? "grayscale" : ""
                      }`}
                    />
                    <div
                      className={`absolute inset-0 bg-linear-to-r ${
                        status === "FINISHED"
                          ? "from-black/90 via-[#1c1d1f]/85 to-[#1c1d1f]/75"
                          : "from-black/80 via-[#1c1d1f]/75 to-[#1c1d1f]/60"
                      }`}
                    />

                    <div className="relative z-10 p-4 sm:p-5">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="text-xs uppercase tracking-[0.25em] text-white border border-white/10 rounded-full px-3 py-1 bg-black/40">
                          {GAME_LABELS[tournoi.game] || tournoi.game}
                        </div>

                        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-white border border-white/10 rounded-full px-3 py-1 bg-black/40">
                          <span className={`h-2 w-2 rounded-full ${STATUS_DOT[status]}`} />
                          {STATUS_LABELS[status]}
                        </div>
                      </div>

                      <div className="mt-4 flex flex-col gap-4 md:flex-row md:justify-between md:items-center">
                        <div className="flex flex-col">
                          <h2 className="text-xl md:text-2xl font-semibold text-white">
                            {tournoi.name}
                          </h2>
                          {tournoi.description && (
                            <p className="text-base text-white mt-2 line-clamp-2">
                              {tournoi.description}
                            </p>
                          )}
                        </div>
                        <div>
                          {status === "FINISHED" && tournoi.winner?.pseudo && (
                            <div className="flex w-full flex-wrap items-center gap-3 rounded-xl border border-[#8F60D0]/40 bg-[#1c1d1f]/80 px-3 py-2 shadow-lg sm:w-auto">
                              <div className="relative h-10 w-10 overflow-hidden rounded-full border-2 border-[#8F60D0] bg-[#232426]">
                                <Image
                                  src={tournoi.winner.avatarUrl || "/avatars/default.svg"}
                                  alt={`Vainqueur ${tournoi.winner.pseudo}`}
                                  fill
                                  sizes="40px"
                                  className="object-cover"
                                />
                              </div>
                              <div className="flex flex-col leading-tight">
                                <span className="text-xs uppercase tracking-wider text-white">
                                  Vainqueur
                                </span>
                                <span className="font-semibold text-base text-white">
                                  {tournoi.winner.pseudo}
                                </span>
                              </div>
                              <Trophy size={18} className="text-[#A855F7]" aria-hidden="true" />
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mt-5 grid grid-cols-1 gap-3 text-base text-white md:grid-cols-3">
                        <div className="flex items-center gap-2">
                          <User size={16} className="text-[#A855F7]" aria-hidden="true" />
                          <span className="text-white">Organisateur:</span>
                          <span className="text-white font-medium truncate">
                            {tournoi.createdBy?.pseudo || "Inconnu"}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Calendar size={16} className="text-[#A855F7]" aria-hidden="true" />
                          <span className="text-white">Date:</span>
                          <span className="text-white font-medium">
                            {dateStr} {timeStr}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Users size={16} className="text-[#A855F7]" aria-hidden="true" />
                          <span className="text-white">Participants:</span>
                          <span className="text-white font-medium">
                            {participantsCount}/{tournoi.maxPlayers}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center gap-3">
                        <div className="h-1.5 flex-1 rounded-full bg-black/40">
                          <div
                            className="h-1.5 rounded-full bg-linear-to-r from-[#8F60D0] to-[#A855F7]"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <span className="text-xs text-white">{Math.round(progress)}%</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            <div className="flex justify-center items-center gap-4 mt-10">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                aria-label="Page précédente des tournois"
                className={`px-4 py-2 rounded-lg bg-[#232426] text-white transition-all cursor-pointer
                ${currentPage === 1 ? "opacity-40 cursor-not-allowed" : "hover:bg-[#8F60D0]"}`}
              >
                Précédent
              </button>

              <span className="text-white font-medium" aria-live="polite" aria-atomic="true">
                Page {currentPage} / {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                aria-label="Page suivante des tournois"
                className={`px-4 py-2 rounded-lg bg-[#232426] text-white transition-all cursor-pointer
                ${currentPage === totalPages ? "opacity-40 cursor-not-allowed" : "hover:bg-[#8F60D0]"}`}
              >
                Suivant
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
