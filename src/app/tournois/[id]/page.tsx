import { notFound } from "next/navigation";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import TournamentJoiner from "@/components/TournamentJoiner";
import TournamentBracket from "@/components/TournamentBracket";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import DeleteTournamentButton from "@/components/DeleteTournamentButton";
import LeaveTournamentButton from "@/components/LeaveTournamentButton";
import TournamentTokensWidget from "@/components/TournamentTokensWidget";
import Link from "next/link";

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

export default async function Page({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const userEmail = session?.user?.email;

  const tournoiId = parseInt(params.id, 10);
  if (isNaN(tournoiId)) return notFound();

  const tournoi = await prisma.tournament.findUnique({
    where: { id: tournoiId },
    include: {
      createdBy: {
        select: {
          id: true,
          pseudo: true,
          email: true,
          avatarUrl: true,
          isDeleted: true,
        },
      },
      participants: {
        where: { isActive: true },
        include: {
          user: {
            select: {
              id: true,
              pseudo: true,
              email: true,
              avatarUrl: true,
              isDeleted: true,
            },
          },
        },
      },
    },
  });

  if (!tournoi) return notFound();

  const isCreator = tournoi.createdBy?.email === userEmail;
  const isParticipant = tournoi.participants.some(p => p.user.email === userEmail);
  const isFull = tournoi.participants.length >= tournoi.maxPlayers;

  const dateObj = new Date(tournoi.date);
  const dateStr = dateObj.toLocaleDateString();
  const timeStr = dateObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  
  // Vérifier si le tournoi a déjà commencé ou est terminé
  const tournamentStarted = dateObj <= new Date();
  const canJoin = !tournamentStarted && !isParticipant && !isFull;

  return (
    <div className="py-10 bg-[#232426] text-white flex flex-col items-center px-6">
      <div className="w-full max-w-5xl bg-gradient-to-br from-[#1c1d1f] to-[#2a2b2f] p-8 rounded-xl shadow-xl border border-[#8F60D0]/20">

        <h1 className="text-4xl font-bold mb-8 text-center">
          {tournoi.name}
        </h1>

        {/* Tokens Widget pour utilisateurs connectés */}
        {session && (
          <div className="mb-8">
            <TournamentTokensWidget />
          </div>
        )}

        {/* Infos générales */}
        <div className="flex flex-col lg:flex-row gap-8 mb-10">
          <div className="w-full lg:w-[300px] flex-shrink-0">
            <div className="relative w-full aspect-[3/2] rounded-lg border-2 border-[#8F60D0] overflow-hidden shadow-lg">
              <Image
                src={getBackgroundImage(tournoi.game)}
                alt={tournoi.name}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 300px"
              />
            </div>
          </div>

          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-300 text-lg">
            <div>
              <p className="text-white font-semibold text-xl mb-1">🎮 Jeu</p>
              <p>{GAME_LABELS[tournoi.game] || tournoi.game}</p>
            </div>
            <div>
              <p className="text-white font-semibold text-xl mb-1">📅 Date</p>
              <p>{dateStr} à {timeStr}</p>
            </div>
            <div>
              <p className="text-white font-semibold text-xl mb-1">👤 Créateur</p>
              <p>{tournoi.createdBy?.isDeleted ? "Utilisateur introuvable" : (tournoi.createdBy?.pseudo || "Inconnu")}</p>
            </div>
            <div>
              <p className="text-white font-semibold text-xl mb-1">👥 Participants max</p>
              <p>{tournoi.maxPlayers}</p>
            </div>
            <div className="sm:col-span-2 mt-4">
              <p className="text-white font-semibold text-xl mb-1">📝 Description</p>
              <p className="text-gray-300 line-clamp-2">{tournoi.description}</p>
              <div className="flex mt-6 items-center gap-6 min-h-[48px]">
                {canJoin && (
                  <TournamentJoiner tournoiId={tournoi.id} textSize="text-xl" />
                )}

                {isFull && !isParticipant && !tournamentStarted && (
                  <p className="text-red-400 font-semibold text-lg">
                    Le tournoi est complet.
                  </p>
                )}

                {tournamentStarted && !isParticipant && (
                  <p className="text-yellow-400 font-semibold text-lg">
                    {tournoi.winnerId ? "Tournoi terminé" : "Tournoi en cours"}
                  </p>
                )}

                {isCreator && (
                  <DeleteTournamentButton id={tournoi.id} textSize="text-xl" />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Participants */}
        <div className="mb-10">
          <h2 className="text-2xl font-semibold text-[#8F60D0] mb-4">Participants</h2>
          {(!tournoi.participants || tournoi.participants.length === 0) ? (
            <p className="text-gray-400 text-lg">Aucun participant pour le moment.</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {tournoi.participants.map((participation) => {
                const participant = participation.user;
                const isCurrentUser = participant.email === userEmail;
                const displayPseudo = participant.isDeleted ? "Utilisateur introuvable" : participant.pseudo;
                const profileLink = participant.isDeleted ? "#" : `/profil/${participant.pseudo}`;

                return (
                  <div
                    key={participant.id}
                    className="relative flex flex-col items-center bg-gradient-to-br from-[#1c1d1f] to-[#2a2b2f] p-8 rounded-xl shadow-xl transition-all duration-300 transform hover:-translate-y-3 hover:shadow-2xl border border-[#8F60D0]/20 hover:border-[#8F60D0]/40"
                  >
                    {(isCurrentUser || isCreator) && !participant.isDeleted && (
                      <LeaveTournamentButton tournoiId={tournoi.id} userId={participant.id} />
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
                      <Link href={profileLink}>
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

        {/* Arbre du tournoi */}
        <div>
          <h2 className="text-2xl font-semibold text-[#8F60D0] mb-4">Arbre du Tournoi</h2>
          <div className="min-h-[600px]">
            <TournamentBracket
              participants={tournoi.participants?.map(p => p.user) || []}
              isCreator={isCreator}
              tournamentId={tournoi.id}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
