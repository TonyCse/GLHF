import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import UserDetailClient from "./UserDetailClient";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AdminUserDetail({ params }: Props) {
  const session = await getServerSession(authOptions);
  const { id } = await params;

  if (!session || session.user.role !== "ADMIN") {
    return notFound();
  }

  const userId = parseInt(id, 10);
  if (!userId) {
    return notFound();
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      createdTournaments: {
        select: {
          id: true,
          name: true,
          game: true,
          date: true,
          isDeleted: true,
          _count: {
            select: {
              participants: {
                where: { isActive: true }
              }
            }
          }
        },
        orderBy: { date: "desc" },
        take: 5
      },
      tournamentParticipations: {
        where: { isActive: true },
        include: {
          tournament: {
            select: {
              id: true,
              name: true,
              game: true,
              date: true,
              isDeleted: true
            }
          }
        },
        orderBy: { joinedAt: "desc" },
        take: 5
      },
      tournamentsVictory: {
        select: {
          id: true,
          name: true,
          game: true,
          date: true
        },
        orderBy: { date: "desc" },
        take: 5
      },
      _count: {
        select: {
          createdTournaments: true,
          tournamentParticipations: {
            where: { isActive: true }
          },
          tournamentsVictory: true,
          matchesWonList: true
        }
      }
    }
  });

  if (!user) {
    return notFound();
  }

  const gameLabels = {
    LEAGUE_OF_LEGENDS: "League of Legends",
    VALORANT: "Valorant", 
    OVERWATCH: "Overwatch",
    FALL_GUYS: "Fall Guys",
    MARVELS_RIVALS: "Marvel's Rivals",
    MINECRAFT: "Minecraft",
  };

  const statusColor = user.isDeleted ? "text-red-400" : "text-green-400";
  const statusLabel = user.isDeleted ? "Supprimé" : "Actif";
  const roleColor = user.role === "ADMIN" ? "text-purple-400" : "text-blue-400";

  return (
    <div className="space-y-6">
      {/* Header avec navigation */}
      <div className="flex items-center gap-4">
        <Link 
          href="/admin/users"
          className="text-[#8F60D0] hover:text-[#A855F7] flex items-center gap-2"
        >
          ← Retour aux utilisateurs
        </Link>
      </div>

      <UserDetailClient 
        user={user}
        statusColor={statusColor}
        statusLabel={statusLabel}
        roleColor={roleColor}
        gameLabels={gameLabels}
      />

      {/* Activité récente */}
      <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
        {/* Tournois créés */}
        <div className="rounded-2xl bg-[#1c1d1f] border border-[#2a2c30] p-4 sm:p-6">
          <h3 className="text-lg font-medium text-white mb-4">Tournois créés récents</h3>
          {user.createdTournaments.length > 0 ? (
            <div className="space-y-3">
              {user.createdTournaments.map((tournament) => (
                <div
                  key={tournament.id}
                  className={`p-3 rounded-lg bg-[#232426] border border-[#2a2c30] ${tournament.isDeleted ? 'opacity-60' : ''}`}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div className="flex-1">
                      <div className={`font-medium text-white ${tournament.isDeleted ? 'line-through' : ''}`}>
                        {tournament.name}
                      </div>
                      <div className="text-xs text-gray-400">
                        {gameLabels[tournament.game as keyof typeof gameLabels]} • {tournament._count.participants} participants
                      </div>
                    </div>
                    <Link
                      href={`/admin/tournois/${tournament.id}`}
                      className="text-xs text-[#8F60D0] hover:text-[#A855F7] self-end sm:self-auto"
                    >
                      Gérer
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-400">Aucun tournoi créé</div>
          )}
        </div>

        {/* Participations */}
        <div className="rounded-2xl bg-[#1c1d1f] border border-[#2a2c30] p-4 sm:p-6">
          <h3 className="text-lg font-medium text-white mb-4">Participations récentes</h3>
          {user.tournamentParticipations.length > 0 ? (
            <div className="space-y-3">
              {user.tournamentParticipations.map((participation) => (
                <div
                  key={participation.id}
                  className={`p-3 rounded-lg bg-[#232426] border border-[#2a2c30] ${participation.tournament.isDeleted ? 'opacity-60' : ''}`}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div className="flex-1">
                      <div className={`font-medium text-white ${participation.tournament.isDeleted ? 'line-through' : ''}`}>
                        {participation.tournament.name}
                      </div>
                      <div className="text-xs text-gray-400">
                        {gameLabels[participation.tournament.game as keyof typeof gameLabels]}
                      </div>
                    </div>
                    <Link
                      href={`/tournois/${participation.tournament.id}`}
                      className="text-xs text-[#8F60D0] hover:text-[#A855F7] self-end sm:self-auto"
                    >
                      Voir
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-400">Aucune participation</div>
          )}
        </div>
      </div>

      {/* Actions rapides */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          href={`/profil/${user.pseudo}`}
          className="w-full sm:w-auto text-center rounded-lg bg-[#8F60D0] hover:bg-[#A855F7] px-4 py-2 text-sm font-medium text-white"
        >
          Voir le profil public
        </Link>
      </div>
    </div>
  );
}
