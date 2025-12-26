import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import FilterForm from "./FilterForm";
import DeleteTournamentCard from "./DeleteTournamentCard";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 10;

type SearchParams = {
  q?: string;
  p?: string;
  status?: string; // "all" | "active" | "finished" | "deleted"
  game?: string;
  ok?: string;
  err?: string;
};

const GAME_LABELS: Record<string, string> = {
  LEAGUE_OF_LEGENDS: "League of Legends",
  VALORANT: "Valorant",
  OVERWATCH: "Overwatch",
  FALL_GUYS: "Fall Guys",
  MARVELS_RIVALS: "Marvel's Rivals",
  MINECRAFT: "Minecraft",
};

function buildQS(params: Record<string, string | undefined>) {
  const usp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v && v.length > 0) usp.set(k, v);
  });
  return usp.toString();
}

export default async function AdminTournaments({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") redirect("/");

  const params = await searchParams;
  const q = (params?.q ?? "").trim();
  const pNum = Number(params?.p ?? "1");
  const page = Number.isFinite(pNum) && pNum > 0 ? pNum : 1;
  const statusFilter = params?.status ?? "all";
  const gameFilter = params?.game ?? "all";

  // Construction de la clause where
  let baseWhere: Record<string, unknown> = {};
  
  // Filtrage par statut
  if (statusFilter === "active") {
    baseWhere = { isDeleted: false, winnerId: null };
  } else if (statusFilter === "finished") {
    baseWhere = { winnerId: { not: null } };
  } else if (statusFilter === "deleted") {
    baseWhere = { isDeleted: true };
  } else if (statusFilter === "all") {
    baseWhere = {};
  }

  // Filtrage par jeu
  if (gameFilter !== "all") {
    baseWhere.game = gameFilter;
  }

  // Recherche textuelle
  const where = q
    ? {
        ...baseWhere,
        OR: [
          { name: { contains: q } },
          { description: { contains: q } },
        ],
      }
    : baseWhere;

  const [total, tournaments] = await Promise.all([
    prisma.tournament.count({ where }),
    prisma.tournament.findMany({
      where,
      orderBy: { id: "asc" }, // Commencer par ID 1, 2, 3...
      take: PAGE_SIZE,
      skip: (page - 1) * PAGE_SIZE,
      include: {
        createdBy: {
          select: { pseudo: true },
        },
        winner: {
          select: { pseudo: true },
        },
        participants: {
          where: { isActive: true },
          select: { id: true },
        },

      },
    }),
  ]);

  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-6">
      {/* Messages d'état */}
      {!!params?.ok && (
        <div className="rounded-lg border border-green-500/30 bg-green-500/10 text-green-200 px-3 py-2 text-sm">
          {params.ok === "tournament_deleted"
            ? "Tournoi supprimé avec succès."
            : params.ok === "tournament_restored"
            ? "Tournoi restauré avec succès."
            : params.ok}
        </div>
      )}
      {!!params?.err && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 text-red-200 px-3 py-2 text-sm">
          Erreur : {params.err}
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h1 className="text-xl font-bold">Gestion des Tournois</h1>

        {/* Filtres et recherche */}
        <div className="flex items-center gap-3 w-full sm:w-auto sm:ml-auto">
          <FilterForm />
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto rounded-2xl border border-[#2a2c30]">
        <table className="min-w-full text-sm">
          <thead className="bg-[#1c1d1f]">
            <tr className="text-left text-gray-300">
              <th className="p-3">ID</th>
              <th className="p-3">Nom</th>
              <th className="p-3">Jeu</th>
              <th className="p-3">Créateur</th>
              <th className="p-3">Participants</th>
              <th className="p-3">Date</th>
              <th className="p-3">Statut</th>
              <th className="p-3">Gagnant</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tournaments.map((tournament) => {
              const isDeleted = tournament.isDeleted;
              const isFinished = !!tournament.winnerId;
              const participantsCount = tournament.participants.length;
              const formattedDate = new Date(tournament.date).toLocaleDateString("fr-FR");

              return (
                <tr
                  key={tournament.id}
                  className={`border-t border-[#2a2c30] ${
                    isDeleted ? "opacity-60" : ""
                  }`}
                >
                  <td className="p-3 text-gray-400">{tournament.id}</td>
                  <td className="p-3">
                    <div className={isDeleted ? "line-through" : ""}>
                      <div className="font-medium text-white">{tournament.name}</div>
                      <div className="text-xs text-gray-400 truncate max-w-40">
                        {tournament.description}
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-[#232426] text-gray-300">
                      {GAME_LABELS[tournament.game] || tournament.game}
                    </span>
                  </td>
                  <td className="p-3 text-gray-300">{tournament.createdBy?.pseudo || "Inconnu"}</td>
                  <td className="p-3">
                    <span className="text-white font-medium">
                      {participantsCount}/{tournament.maxPlayers}
                    </span>
                  </td>
                  <td className="p-3 text-gray-400">{formattedDate}</td>
                  <td className="p-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                        isDeleted
                          ? "bg-[#2a2c30] text-gray-400"
                          : isFinished
                          ? "bg-green-900/30 text-green-300"
                          : "bg-blue-900/30 text-blue-300"
                      }`}
                    >
                      {isDeleted ? "Supprimé" : isFinished ? "Terminé" : "Actif"}
                    </span>
                  </td>
                  <td className="p-3">
                    {tournament.winner?.pseudo ? (
                      <span className="text-yellow-400 font-medium">
                        {tournament.winner.pseudo}
                      </span>
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}
                  </td>
                  <td className="p-3 text-right space-x-2">
                    <Link
                      href={`/admin/tournois/${tournament.id}`}
                      className="rounded-lg bg-[#8F60D0] hover:bg-[#A855F7] px-3 py-1.5 text-xs text-white"
                      title="Gérer le tournoi"
                    >
                      Gérer
                    </Link>

                    <Link
                      href={`/tournois/${tournament.id}`}
                      className="rounded-lg border border-[#2a2c30] hover:border-[#8F60D0] px-3 py-1.5 text-xs"
                    >
                      Voir
                    </Link>

                    {/* Toggle delete / restore */}
                    <form
                      method="POST"
                      action={`/api/admin/tournaments/${tournament.id}/toggle-delete`}
                      className="inline"
                    >
                      <button
                        className={`rounded-lg px-3 py-1.5 text-xs border ${
                          isDeleted
                            ? "border-green-600/40 text-green-300 hover:border-green-500 hover:text-green-200"
                            : "border-red-600/40 text-red-300 hover:border-red-500 hover:text-red-200"
                        }`}
                        title={
                          isDeleted
                            ? "Restaurer le tournoi"
                            : "Supprimer le tournoi"
                        }
                      >
                        {isDeleted ? "Restaurer" : "Supprimer"}
                      </button>
                    </form>
                  </td>
                </tr>
              );
            })}
            {tournaments.length === 0 && (
              <tr>
                <td colSpan={9} className="p-6 text-center text-gray-400">
                  Aucun tournoi trouvé.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {tournaments.map((tournament) => {
          const isDeleted = tournament.isDeleted;
          const isFinished = !!tournament.winnerId;
          const participantsCount = tournament.participants.length;
          const formattedDate = new Date(tournament.date).toLocaleDateString("fr-FR");

          return (
            <div
              key={tournament.id}
              className={`rounded-2xl bg-[#1c1d1f] border border-[#2a2c30] p-4 ${
                isDeleted ? "opacity-60" : ""
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-lg font-medium text-white ${isDeleted ? "line-through" : ""}`}>
                      {tournament.name}
                    </span>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                        isFinished
                          ? "bg-green-800 text-green-200"
                          : isDeleted
                          ? "bg-red-800 text-red-200"
                          : "bg-blue-800 text-blue-200"
                      }`}
                    >
                      {isFinished ? "Terminé" : isDeleted ? "Supprimé" : "En cours"}
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-400 mb-1">ID: {tournament.id}</div>
                  
                  <div className="flex items-center gap-3 text-xs text-gray-400 mb-2">
                    <span className="inline-flex items-center rounded-full px-2 py-1 bg-[#232426] text-gray-300">
                      {GAME_LABELS[tournament.game] || tournament.game}
                    </span>
                    <span>Par: {tournament.createdBy?.pseudo || "Inconnu"}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-gray-400">Participants:</span>
                      <span className="text-white font-medium ml-1">
                        {participantsCount}/{tournament.maxPlayers}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Date:</span>
                      <span className="text-white ml-1">{formattedDate}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-400">Gagnant:</span>
                      <span className="text-white ml-1">
                        {tournament.winner 
                          ? (tournament.winner.isDeleted ? "[Utilisateur supprimé]" : tournament.winner.pseudo)
                          : "En cours"
                        }
                      </span>
                    </div>
                  </div>

                  {tournament.description && (
                    <div className="text-xs text-gray-400 mt-2 truncate">
                      {tournament.description}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/admin/tournois/${tournament.id}`}
                  className="rounded-lg bg-[#8F60D0] hover:bg-[#A855F7] px-3 py-2 text-sm text-white flex-1 text-center"
                >
                  Gérer
                </Link>

                <Link
                  href={`/tournois/${tournament.id}`}
                  className="rounded-lg border border-[#2a2c30] hover:border-[#8F60D0] px-3 py-2 text-sm flex-1 text-center"
                >
                  Voir
                </Link>

                {!isDeleted && (
                  <DeleteTournamentCard tournamentId={tournament.id} />
                )}
              </div>
            </div>
          );
        })}
        {tournaments.length === 0 && (
          <div className="rounded-2xl bg-[#1c1d1f] border border-[#2a2c30] p-6 text-center text-gray-400">
            Aucun tournoi trouvé.
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex flex-wrap items-center justify-center gap-2 text-sm">
        {Array.from({ length: pages }, (_, i) => i + 1).map((n) => {
          const href = `/admin/tournois?${buildQS({
            q,
            p: String(n),
            status: statusFilter !== "all" ? statusFilter : undefined,
            game: gameFilter !== "all" ? gameFilter : undefined,
          })}`;
          const isActive = n === page;
          return (
            <Link
              key={n}
              href={href}
              className={`rounded-lg px-3 py-2 border transition-colors ${
                isActive
                  ? "border-[#8F60D0] text-[#8F60D0] bg-[#8F60D0]/10"
                  : "border-[#2a2c30] text-gray-400 hover:border-[#8F60D0] hover:text-[#8F60D0]"
              }`}
            >
              {n}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
