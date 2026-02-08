import Link from "next/link";
import Image from "next/image";
import { Medal } from "lucide-react";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const PLAYERS_PER_PAGE = 10;

type SearchParams = {
  p?: string;
};

export default async function Classement({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const pNum = Number(searchParams?.p ?? "1");
  const page = Number.isFinite(pNum) && pNum > 0 ? pNum : 1;
  const skip = (page - 1) * PLAYERS_PER_PAGE;

  const [totalPlayers, players] = await Promise.all([
    prisma.user.count({ where: { isDeleted: false } }),
    prisma.user.findMany({
      where: { isDeleted: false },
      orderBy: { ranking: "desc" },
      select: {
        id: true,
        pseudo: true,
        avatarUrl: true,
        ranking: true,
      },
      take: PLAYERS_PER_PAGE,
      skip,
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalPlayers / PLAYERS_PER_PAGE));

  return (
    <div className="flex flex-col items-center justify-center px-4 py-10 bg-[#232426] w-full">
      <div className="bg-gradient-to-br from-[#1c1d1f] to-[#2a2b2f] p-8 w-full max-w-3xl rounded-xl shadow-xl border border-[#8F60D0]/20">
        <h1 className="text-4xl font-extrabold text-white text-center mb-8">
          Classement des joueurs
        </h1>

        {totalPlayers === 0 ? (
          <p className="text-center text-gray-400 text-lg">Aucun joueur trouve.</p>
        ) : (
          <>
            <div className="space-y-4">
              {players.map((player, index) => {
                const realRank = skip + index + 1;
                return (
                  <Link key={player.id} href={`/profil/${player.pseudo}`}>
                    <div className="flex justify-between items-center bg-[#2a2b2e] mb-8 p-4 rounded-xl shadow-xl transition-all duration-300 transform hover:-translate-y-3 hover:shadow-2xl border border-[#8F60D0]/20 hover:border-[#8F60D0]/40">
                      <div className="flex items-center gap-4">
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

                        {realRank > 3 && (
                          <span className="text-lg font-bold text-[#8F60D0]">
                            #{realRank}
                          </span>
                        )}

                        <Image
                          src={player.avatarUrl || "/avatars/default.png"}
                          alt={player.pseudo}
                          width={40}
                          height={40}
                          className="w-10 h-10 rounded-full object-cover"
                        />

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

            <div className="flex justify-center items-center gap-4 mt-8">
              {page > 1 ? (
                <Link
                  href={`/ranking?p=${page - 1}`}
                  className="px-4 py-2 rounded-lg bg-[#1c1d1f] text-white transition-all hover:bg-[#8F60D0] cursor-pointer"
                >
                  Precedent
                </Link>
              ) : (
                <span className="px-4 py-2 rounded-lg bg-[#1c1d1f] text-white opacity-40 cursor-not-allowed">
                  Precedent
                </span>
              )}

              <span className="text-white font-medium">
                Page {page} / {totalPages}
              </span>

              {page < totalPages ? (
                <Link
                  href={`/ranking?p=${page + 1}`}
                  className="px-4 py-2 rounded-lg bg-[#1c1d1f] text-white transition-all hover:bg-[#8F60D0] cursor-pointer"
                >
                  Suivant
                </Link>
              ) : (
                <span className="px-4 py-2 rounded-lg bg-[#1c1d1f] text-white opacity-40 cursor-not-allowed">
                  Suivant
                </span>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
