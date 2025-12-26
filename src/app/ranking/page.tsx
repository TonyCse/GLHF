"use client";

import { useEffect, useState } from "react";
import { Medal } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface Player {
  id: number;
  pseudo: string;
  avatarUrl: string;
  ranking: number;
}

export default function Classement() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const playersPerPage = 10;
  const totalPages = Math.ceil(players.length / playersPerPage);

  useEffect(() => {
    const fetchRanking = async () => {
      try {
        const res = await fetch("/api/user/ranking");
        if (!res.ok) throw new Error("Erreur de récupération");
        const data = await res.json();
        setPlayers(data);
      } catch (err) {
        console.error("Erreur:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRanking();
  }, []);

  const indexOfLastPlayer = currentPage * playersPerPage;
  const indexOfFirstPlayer = indexOfLastPlayer - playersPerPage;
  const currentPlayers = players.slice(indexOfFirstPlayer, indexOfLastPlayer);

  return (
    <div className="flex flex-col items-center justify-center px-4 py-10 bg-[#232426] w-full ">
      <div className="bg-gradient-to-br from-[#1c1d1f] to-[#2a2b2f] p-8 w-full max-w-3xl rounded-xl shadow-xl border border-[#8F60D0]/20">
        <h1 className="text-4xl font-extrabold text-white text-center mb-8">
          Classement des joueurs
        </h1>

        {loading ? (
          <p className="text-center text-gray-400 text-lg">Chargement...</p>
        ) : players.length === 0 ? (
          <p className="text-center text-gray-400 text-lg">Aucun joueur trouvé.</p>
        ) : (
          <>
            <div className="space-y-4">
              {currentPlayers.map((player, index) => {
                const realRank = indexOfFirstPlayer + index + 1; // Numéro global (#1, #2, ...)
                return (
                  <Link key={player.id} href={`/profil/${player.pseudo}`}>
                    <div
                      className="flex justify-between items-center bg-[#2a2b2e] mb-8 p-4 rounded-xl shadow-xl transition-all duration-300 transform hover:-translate-y-3 hover:shadow-2xl border border-[#8F60D0]/20 hover:border-[#8F60D0]/40"
                    >
                      <div className="flex items-center gap-4">
                        {/* Médaille pour le top 3 */}
                        {realRank <= 3 && (
                          <Medal
                            size={24}
                            className={
                              realRank === 1
                                ? "text-yellow-400"
                                : realRank === 2
                                ? "text-gray-300"
                                : "text-orange-400"
                            }
                          />
                        )}

                        {/* Numéro de classement pour les autres */}
                        {realRank > 3 && (
                          <span className="text-lg font-bold text-[#8F60D0]">
                            #{realRank}
                          </span>
                        )}

                        {/* Avatar */}
                        <Image
                          src={player.avatarUrl}
                          alt={player.pseudo}
                          width={40}
                          height={40}
                          className="w-10 h-10 rounded-full object-cover"
                        />

                        {/* Pseudo */}
                        <span className="text-lg font-medium text-white">
                          {player.pseudo}
                        </span>
                      </div>
                      <span className="text-xl font-bold text-white">
                        {player.ranking} pts
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Pagination */}
            <div className="flex justify-center items-center gap-4 mt-8">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded-lg bg-[#1c1d1f] text-white transition-all cursor-pointer
                ${currentPage === 1 ? "opacity-40 cursor-not-allowed" : "hover:bg-[#8F60D0]"}`}
              >
                Précédent
              </button>

              <span className="text-white font-medium">
                Page {currentPage} / {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 rounded-lg bg-[#1c1d1f] text-white transition-all cursor-pointer
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
