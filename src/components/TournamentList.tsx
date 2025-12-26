"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Users, Crown, Calendar, User, Trophy, Zap, Star } from "lucide-react";
import TokensWidget from "./TokensWidget";
import { useSession } from "next-auth/react";

interface Participant {
  id: number;
  pseudo: string;
  email: string;
}

interface Tournament {
  id: number;
  name: string;
  description?: string;
  maxPlayers: number;
  date: string;
  game: string;
  winner?: Participant;
  participants?: Participant[];
  createdAt: string;
  createdBy?: {
    pseudo: string;
  };
}

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
    VALORANT: "/images/valorant_bg.png",
    OVERWATCH: "/images/ow_bg.jpg",
    FALL_GUYS: "/images/fg_bg.jpg",
    MARVELS_RIVALS: "/images/marvel_bg.jpg",
    MINECRAFT: "/images/minecraft_bg.jpg",
  };
  return map[game] || "/images/default.jpg";
};

export default function TournamentList() {
  const { data: session } = useSession();
  const [tournois, setTournois] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [gameFilter, setGameFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const itemsPerPage = 10;

  const searchParams = useSearchParams();
  const gameFromURL = searchParams.get("game");

  useEffect(() => {
    if (gameFromURL && gameFilter === "ALL") {
      setGameFilter(gameFromURL);
    }
  }, [gameFromURL, gameFilter]);

  useEffect(() => {
    const fetchTournois = async () => {
      try {
        const res = await fetch("/api/tournament/list");
        const data = await res.json();

        const sorted: Tournament[] = [
          ...data.filter((t: Tournament) => !t.winner && (t.participants?.length || 0) < t.maxPlayers),
          ...data.filter((t: Tournament) => !t.winner && (t.participants?.length || 0) >= t.maxPlayers),
          ...data.filter((t: Tournament) => !!t.winner),
        ];

        setTournois(sorted);
      } catch (err) {
        console.error("Erreur récupération tournois :", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTournois();
  }, []);

  const filteredTournois = tournois
    .filter((t) => {
      if (gameFilter === "ALL") return true;
      return t.game === gameFilter;
    })
    .filter((t) => {
      const participantsCount = t.participants?.length || 0;
      const isFull = participantsCount >= t.maxPlayers;
      const isFinished = !!t.winner;
      const tournamentStarted = new Date(t.date) <= new Date();

      if (statusFilter === "OPEN") return !isFinished && !isFull && !tournamentStarted;
      if (statusFilter === "FULL") return !isFinished && isFull && !tournamentStarted;
      if (statusFilter === "IN_PROGRESS") return !isFinished && tournamentStarted;
      if (statusFilter === "FINISHED") return isFinished;
      return true;
    });

  const totalPages = Math.ceil(filteredTournois.length / itemsPerPage);
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentTournois = filteredTournois.slice(indexOfFirst, indexOfLast);

  const renderStatus = (tournoi: Tournament) => {
    const participantsCount = tournoi.participants?.length || 0;
    const isFull = participantsCount >= tournoi.maxPlayers;
    const isFinished = !!tournoi.winner;
    const tournamentStarted = new Date(tournoi.date) <= new Date();

    if (isFinished) {
      return (
        <div className="absolute top-4 right-4 bg-gradient-to-r from-amber-500 via-yellow-400 to-orange-400 text-gray-900 text-sm md:text-lg px-3 md:px-4 py-2 rounded-full font-bold flex items-center gap-2 shadow-xl border border-cyan-300/60 backdrop-blur-sm">
          <Crown size={18} className="animate-pulse text-gray-800" />
          <span className="hidden sm:inline font-black">Terminé</span>
        </div>
      );
    }

    if (tournamentStarted && !isFinished) {
      return (
        <div className="absolute top-4 right-4 bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm md:text-lg px-3 md:px-4 py-2 rounded-full font-bold flex items-center gap-2 shadow-xl border border-orange-400/50 backdrop-blur-sm">
          <Zap size={18} className="animate-pulse" />
          <span className="hidden sm:inline">En cours</span>
        </div>
      );
    }

    if (isFull) {
      return (
        <div className="absolute top-4 right-4 bg-gradient-to-r from-red-600 to-red-800 text-white text-sm md:text-lg px-3 md:px-4 py-2 rounded-full font-bold flex items-center gap-2 shadow-xl border border-red-400/50 backdrop-blur-sm">
          <Users size={18} />
          <span className="hidden sm:inline">Complet</span>
        </div>
      );
    }

    return (
      <div className="absolute top-4 right-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm md:text-lg px-3 md:px-4 py-2 rounded-full font-bold shadow-xl border border-green-300/50 backdrop-blur-sm animate-pulse">
        <div className="flex items-center gap-2">
          <Zap size={18} className="animate-bounce" />
          <span className="hidden sm:inline">Ouvert</span>
        </div>
      </div>
    );
  };

  if (loading) {
    return <p className="text-center text-gray-400 text-2xl">Chargement...</p>;
  }

  return (
    <div className="py-10 bg-[#232426] text-white flex flex-col items-center px-6">
      <div className="w-full max-w-6xl bg-gradient-to-br from-[#1c1d1f] to-[#2a2b2f] p-8 rounded-xl shadow-xl border border-[#8F60D0]/20">
        <h1 className="text-4xl font-bold text-white mb-8 text-center">
          Liste des Tournois
        </h1>

        {/* Tokens Widget pour utilisateurs connectés */}
        {session && (
          <div className="mb-8">
            <TokensWidget compact className="max-w-md mx-auto" />
          </div>
        )}

        {/* Filtres */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <select
            value={gameFilter}
            onChange={(e) => { setGameFilter(e.target.value); setCurrentPage(1); }}
            className="bg-[#2a2b2f] text-white px-4 py-2 rounded-lg border border-[#8F60D0]/30 hover:border-[#8F60D0] transition cursor-pointer text-lg"
          >
            <option value="ALL">Tous les jeux</option>
            {Object.entries(GAME_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="bg-[#2a2b2f] text-white px-4 py-2 rounded-lg border border-[#8F60D0]/30 hover:border-[#8F60D0] transition cursor-pointer text-lg"
          >
            <option value="ALL">Tous les états</option>
            <option value="OPEN">Tournois ouverts</option>
            <option value="FULL">Tournois complets</option>
            <option value="IN_PROGRESS">Tournois en cours</option>
            <option value="FINISHED">Tournois terminés</option>
          </select>
        </div>

        {filteredTournois.length === 0 ? (
          <p className="text-center text-gray-400 text-2xl">Aucun tournoi trouvé.</p>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6">
              {currentTournois.map((tournoi) => {
                const dateObj = new Date(tournoi.date);
                const dateStr = dateObj.toLocaleDateString();
                const timeStr = dateObj.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                });

                const participantsCount = tournoi.participants?.length || 0;
                const isFull = participantsCount >= tournoi.maxPlayers;
                const isFinished = !!tournoi.winner;
                const tournamentStarted = dateObj <= new Date();
                
                // Overlay adaptatif selon le statut avec nouveau style pour les terminés
                const overlayClass = isFinished
                  ? "bg-gradient-to-r from-black/70 via-amber-900/40 to-black/70"
                  : isFull
                  ? "bg-gradient-to-r from-black/80 via-gray-800/75 to-black/80"
                  : "bg-gradient-to-r from-black/60 via-gray-900/50 to-black/60";

                return (
                  <Link
                    key={tournoi.id}
                    href={`/tournois/${tournoi.id}`}
                    className="relative w-full rounded-xl overflow-hidden shadow-lg hover:scale-[1.01] transition-transform duration-300 group"
                    style={{
                      backgroundImage: `url(${getBackgroundImage(tournoi.game)})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  >
                    <div className={`absolute inset-0 ${overlayClass} group-hover:opacity-90 transition-opacity duration-300`} />
                    
                    {/* Effet de bordure selon le statut avec nouveau style pour les terminés */}
                    <div className={`absolute inset-0 rounded-xl ${
                      isFinished 
                        ? "ring-2 ring-gradient-to-r from-amber-400 via-cyan-300 to-orange-400 shadow-[0_0_20px_rgba(245,158,11,0.4)]" 
                        : isFull 
                        ? "ring-2 ring-red-500/30" 
                        : "ring-2 ring-green-500/30 group-hover:ring-[#8F60D0]/50"
                    } transition-all duration-300`} />
                    
                    {/* Effet de lueur dorée pour les tournois terminés */}
                    {isFinished && (
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-amber-400/10 via-transparent to-cyan-400/10 animate-pulse" />
                    )}
                    
                    <div className="relative z-10 p-4 md:p-6 text-white">
                      {renderStatus(tournoi)}

                      {/* Header avec badge de jeu */}
                      <div className="mb-4">
                        <div className="inline-block bg-[#8F60D0]/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs md:text-sm font-semibold uppercase tracking-wider mb-3 border border-[#8F60D0]/50">
                          {GAME_LABELS[tournoi.game] || tournoi.game}
                        </div>
                        
                        <h2 className={`text-xl md:text-2xl font-bold mb-2 transition-colors duration-300 ${
                          isFinished 
                            ? "text-amber-200 group-hover:text-cyan-300" 
                            : "text-white group-hover:text-[#8F60D0]"
                        }`}>
                          {tournoi.name}
                        </h2>
                        <p className="text-gray-300 text-sm md:text-base leading-relaxed">{tournoi.description}</p>
                      </div>

                      {/* Informations du tournoi avec icônes modernes */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 text-sm md:text-base">
                        <div className="flex items-center gap-3 bg-black/20 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/10">
                          <User size={18} className="text-blue-400 flex-shrink-0" />
                          <div className="min-w-0">
                            <div className="text-xs text-gray-400 uppercase tracking-wide">Organisateur</div>
                            <div className="font-semibold text-white truncate">{tournoi.createdBy?.pseudo || "Inconnu"}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 bg-black/20 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/10">
                          <Calendar size={18} className="text-purple-400 flex-shrink-0" />
                          <div className="min-w-0">
                            <div className="text-xs text-gray-400 uppercase tracking-wide">Date</div>
                            <div className="font-semibold text-white">
                              <div className="truncate">{dateStr}</div>
                              <div className="text-gray-300 text-xs">{timeStr}</div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 bg-black/20 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/10">
                          <Users size={18} className="text-green-400 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">Participants</div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white text-lg">
                                {participantsCount}/{tournoi.maxPlayers}
                              </span>
                              <div className="flex-1 bg-gray-700 rounded-full h-2 min-w-[40px]">
                                <div 
                                  className={`h-2 rounded-full transition-all duration-500 ${
                                    isFinished 
                                      ? "bg-gradient-to-r from-amber-400 via-yellow-300 to-cyan-400" 
                                      : isFull 
                                      ? "bg-gradient-to-r from-red-500 to-red-600" 
                                      : "bg-gradient-to-r from-[#8F60D0] to-purple-400"
                                  }`}
                                  style={{ width: `${(participantsCount / tournoi.maxPlayers) * 100}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Section gagnant avec design GLHF */}
                      {isFinished && tournoi.winner?.pseudo && (
                        <div className="mt-6 relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-[#8F60D0]/30 via-purple-500/30 to-[#8F60D0]/30 rounded-xl blur-sm animate-pulse" />
                          
                          <div className="relative bg-gradient-to-r from-[#8F60D0] via-purple-600 to-[#8F60D0] p-[2px] rounded-xl shadow-2xl">
                            <div className="bg-gradient-to-r from-[#1c1d1f]/95 via-[#232426]/95 to-[#1c1d1f]/95 p-4 rounded-xl backdrop-blur-sm">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="relative">
                                    <div className="absolute inset-0 bg-gradient-to-r from-[#8F60D0] to-purple-500 rounded-full blur-sm animate-pulse" />
                                    <div className="relative bg-gradient-to-r from-[#8F60D0] to-purple-400 p-2 rounded-full">
                                      <Trophy size={28} className="text-white drop-shadow-lg" />
                                    </div>
                                  </div>
                                  <div>
                                    <div className="text-[#DCCEFF] text-xs font-semibold uppercase tracking-wider flex items-center gap-1">
                                      <span className="text-purple-400">⚡</span> Champion du Tournoi <span className="text-purple-400">⚡</span>
                                    </div>
                                    <div className="text-transparent bg-gradient-to-r from-white via-purple-100 to-[#8F60D0] bg-clip-text text-lg md:text-xl font-black drop-shadow-md">
                                      {tournoi.winner.pseudo}
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="hidden md:flex gap-1">
                                  {[...Array(3)].map((_, i) => (
                                    <Star 
                                      key={i} 
                                      size={20} 
                                      className="text-[#8F60D0] animate-pulse" 
                                      style={{ animationDelay: `${i * 0.2}s` }}
                                      fill="currentColor"
                                    />
                                  ))}
                                </div>
                              </div>
                              
                              {/* Particules décoratives */}
                              <div className="absolute top-2 left-4 w-1 h-1 bg-[#8F60D0] rounded-full animate-ping" />
                              <div className="absolute top-4 right-6 w-1 h-1 bg-purple-400 rounded-full animate-ping" style={{ animationDelay: '0.5s' }} />
                              <div className="absolute bottom-2 left-8 w-1 h-1 bg-white rounded-full animate-ping" style={{ animationDelay: '1s' }} />
                              <div className="absolute bottom-4 right-4 w-1 h-1 bg-[#8F60D0] rounded-full animate-ping" style={{ animationDelay: '1.5s' }} />
                            </div>
                          </div>
                        </div>
                      )}

                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Pagination */}
            <div className="flex justify-center items-center gap-4 mt-10">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded-lg bg-[#1c1d1f] text-white transition-all cursor-pointer text-lg
                ${currentPage === 1 ? "opacity-40 cursor-not-allowed" : "hover:bg-[#8F60D0]"}`}
              >
                Précédent
              </button>

              <span className="text-white font-medium text-lg">
                Page {currentPage} / {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 rounded-lg bg-[#1c1d1f] text-white transition-all cursor-pointer text-lg
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