import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import Link from "next/link";
import UserDetailClient from "./UserDetailClient";

interface Props {
  params: Promise<{ id: string }>;
}

// Affiche les details d'un user
export default async function AdminUserDetail({ params }: Props) {
  const session = await auth();
  const { id } = await params;

  if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
    return notFound();
  }
  const viewerRole = session.user.role;

  const userId = parseInt(id, 10);
  if (!userId) {
    return notFound();
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      plan: true,
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
                where: { isActive: true },
              },
            },
          },
        },
        orderBy: { date: "desc" },
        take: 5,
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
              isDeleted: true,
            },
          },
        },
        orderBy: { joinedAt: "desc" },
        take: 5,
      },
      tournamentsVictory: {
        select: {
          id: true,
          name: true,
          game: true,
          date: true,
        },
        orderBy: { date: "desc" },
        take: 5,
      },
      _count: {
        select: {
          createdTournaments: true,
          tournamentParticipations: {
            where: { isActive: true },
          },
          tournamentsVictory: true,
          matchesWonList: true,
        },
      },
    },
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
  const roleColor =
    user.role === "SUPER_ADMIN"
      ? "text-amber-400"
      : user.role === "ADMIN"
        ? "text-purple-400"
        : "text-blue-400";

  return (
    <div className="space-y-6">
      {/* Fil d'Ariane */}
      <nav aria-label="Fil d'Ariane" className="text-sm text-gray-400">
        <ol className="flex items-center gap-2">
          <li><Link href="/admin" className="hover:text-[#8F60D0] transition-colors">Admin</Link></li>
          <li aria-hidden="true">/</li>
          <li><Link href="/admin/users" className="hover:text-[#8F60D0] transition-colors">Utilisateurs</Link></li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-white">{user.pseudo}</li>
        </ol>
      </nav>

      <UserDetailClient
        user={user}
        statusColor={statusColor}
        statusLabel={statusLabel}
        roleColor={roleColor}
        viewerRole={viewerRole}
        gameLabels={gameLabels}
      />

      {/* Activite recente */}
      <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
        {/* Tournois crees */}
        <div className="rounded-2xl bg-[#1c1d1f] border border-[#2a2c30] p-4 sm:p-6">
          <h3 className="text-lg font-medium text-white mb-4">Tournois créés récents</h3>
          {user.createdTournaments.length > 0 ? (
            <div className="space-y-3">
              {user.createdTournaments.map((tournament) => (
                <div
                  key={tournament.id}
                  className={`p-3 rounded-lg bg-[#232426] border border-[#2a2c30] ${tournament.isDeleted ? "opacity-60" : ""}`}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div className="flex-1">
                      <div
                        className={`font-medium text-white ${tournament.isDeleted ? "line-through" : ""}`}
                      >
                        {tournament.name}
                      </div>
                      <div className="text-xs text-gray-400">
                        {gameLabels[tournament.game as keyof typeof gameLabels]} •{" "}
                        {tournament._count.participants} participants
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
                  className={`p-3 rounded-lg bg-[#232426] border border-[#2a2c30] ${participation.tournament.isDeleted ? "opacity-60" : ""}`}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div className="flex-1">
                      <div
                        className={`font-medium text-white ${participation.tournament.isDeleted ? "line-through" : ""}`}
                      >
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
