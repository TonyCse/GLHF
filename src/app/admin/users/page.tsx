import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import FilterForm from "./FilterForm";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

type SearchParams = {
  q?: string;
  p?: string;
  show?: string; // "all" pour afficher aussi les supprimés
  ok?: string;
  err?: string;
};

function buildQS(params: Record<string, string | undefined>) {
  const usp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v && v.length > 0) usp.set(k, v);
  });
  return usp.toString();
}

export default async function AdminUsers({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/");

  const params = await searchParams;
  const selfId = Number(session.user.id);
  const q = (params?.q ?? "").trim();
  const pNum = Number(params?.p ?? "1");
  const page = Number.isFinite(pNum) && pNum > 0 ? pNum : 1;
  const showAll = (params?.show ?? "") === "all";

  const baseWhere = showAll ? {} : { isDeleted: false };
  const where = q
    ? {
        ...baseWhere,
        OR: [{ email: { contains: q } }, { pseudo: { contains: q } }],
      }
    : baseWhere;

  const [total, rows] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      orderBy: { id: "asc" }, // Commencer par ID 1, 2, 3...
      take: PAGE_SIZE,
      skip: (page - 1) * PAGE_SIZE,
      select: {
        id: true,
        email: true,
        pseudo: true,
        role: true,
        isDeleted: true,
        createdAt: true,
      },
    }),
  ]);

  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-6">
      {/* Bandeaux état */}
      {!!params?.ok && (
        <div className="rounded-lg border border-green-500/30 bg-green-500/10 text-green-200 px-3 py-2 text-sm">
          {params.ok === "soft_toggled"
            ? "Statut mis à jour."
            : params.ok}
        </div>
      )}
      {!!params?.err && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 text-red-200 px-3 py-2 text-sm">
          Erreur : {params.err}
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Gestion des utilisateurs</h1>
          <p className="text-base text-gray-400 mt-1">{total} utilisateur{total > 1 ? 's' : ''} au total</p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          <FilterForm />
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto rounded-2xl border border-[#2a2c30]">
        <table className="min-w-full text-base">
          <thead className="bg-[#1c1d1f]">
            <tr className="text-left text-gray-300">
              <th className="p-4 text-base font-medium">ID</th>
              <th className="p-4 text-base font-medium">Pseudo</th>
              <th className="p-4 text-base font-medium">Email</th>
              <th className="p-4 text-base font-medium">Rôle</th>
              <th className="p-4 text-base font-medium">Créé le</th>
              <th className="p-4 text-base font-medium">Statut</th>
              <th className="p-4 text-right text-base font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((u) => {
              const isSelf = u.id === selfId;
              return (
                <tr
                  key={u.id}
                  className={`border-t border-[#2a2c30] ${
                    u.isDeleted ? "opacity-60" : ""
                  }`}
                >
                  <td className="p-4 text-gray-400">{u.id}</td>
                  <td className="p-4">
                    <span className={u.isDeleted ? "line-through" : ""}>
                      {u.pseudo}
                    </span>
                  </td>
                  <td className="p-4 text-gray-300">{u.email}</td>
                  <td className="p-4">
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
                        u.role === "ADMIN"
                          ? "bg-[#2b2140] text-[#cdb5ff]"
                          : "bg-[#232426] text-gray-300"
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="p-4 text-gray-400">
                    {new Date(u.createdAt).toLocaleDateString("fr-FR")}
                  </td>
                  <td className="p-4">
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
                        u.isDeleted
                          ? "bg-[#2a2c30] text-gray-400"
                          : "bg-[#232426] text-gray-300"
                      }`}
                    >
                      {u.isDeleted ? "Supprimé" : "Actif"}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <Link
                      href={`/admin/users/${u.id}`}
                      className="rounded-lg bg-[#8F60D0] hover:bg-[#A855F7] px-4 py-2 text-sm text-white"
                      title="Gérer l'utilisateur"
                    >
                      Gérer
                    </Link>

                    <Link
                      href={`/profil/${u.pseudo}`}
                      className="rounded-lg border border-[#2a2c30] hover:border-[#8F60D0] px-4 py-2 text-sm"
                      title="Voir le profil public"
                    >
                      Voir
                    </Link>

                    <form
                      method="POST"
                      action={`/api/admin/users/${u.id}/toggle-role`}
                      className="inline"
                    >
                      <button
                        className={`rounded-lg border px-4 py-2 text-sm min-w-[100px] transition-colors ${
                          isSelf
                            ? "border-[#2a2c30] text-gray-500 cursor-not-allowed opacity-60"
                            : u.role === "ADMIN"
                            ? "border-blue-600/40 text-blue-300 hover:border-blue-500 hover:text-blue-200"
                            : "border-purple-600/40 text-purple-300 hover:border-purple-500 hover:text-purple-200"
                        }`}
                        title={
                          isSelf
                            ? "Vous ne pouvez pas changer votre propre rôle"
                            : "Basculer le rôle"
                        }
                        disabled={isSelf}
                      >
                        {u.role === "ADMIN" ? "↓ USER" : "↑ ADMIN"}
                      </button>
                    </form>

                    <form
                      method="POST"
                      action={`/api/admin/users/${u.id}/toggle-delete`}
                      className="inline"
                    >
                      <button
                        className={`rounded-lg px-4 py-2 text-sm border ${
                          isSelf
                            ? "border-[#2a2c30] text-gray-500 cursor-not-allowed opacity-60"
                            : u.isDeleted
                            ? "border-green-600/40 text-green-300 hover:border-green-500 hover:text-green-200"
                            : "border-red-600/40 text-red-300 hover:border-red-500 hover:text-red-200"
                        }`}
                        title={
                          isSelf
                            ? "Vous ne pouvez pas vous supprimer vous-même"
                            : u.isDeleted
                            ? "Restaurer l'utilisateur"
                            : "Supprimer (soft delete)"
                        }
                        disabled={isSelf}
                      >
                        {u.isDeleted ? "Restaurer" : "Supprimer"}
                      </button>
                    </form>
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="p-6 text-center text-gray-400">
                  Aucun utilisateur trouvé.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden space-y-4">
        {rows.map((u) => {
          const isSelf = u.id === selfId;
          return (
            <div
              key={u.id}
              className={`rounded-xl bg-[#1c1d1f] border border-[#2a2c30] overflow-hidden ${
                u.isDeleted ? "opacity-70" : ""
              }`}
            >
              {/* Header avec pseudo et badges */}
              <div className="bg-[#232426] p-4 border-b border-[#2a2c30]">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`text-lg font-semibold text-white truncate ${u.isDeleted ? "line-through" : ""}`}>
                      {u.pseudo}
                    </span>
                    <span className="text-xs text-gray-500 flex-shrink-0">#{u.id}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                        u.role === "ADMIN"
                          ? "bg-purple-600 text-purple-100"
                          : "bg-gray-600 text-gray-200"
                      }`}
                    >
                      {u.role}
                    </span>
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                        u.isDeleted
                          ? "bg-red-600 text-red-100"
                          : "bg-green-600 text-green-100"
                      }`}
                    >
                      {u.isDeleted ? "Supprimé" : "Actif"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Contenu */}
              <div className="p-4 space-y-4">
                {/* Informations utilisateur */}
                <div className="space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-sm">
                    <span className="text-gray-400 font-medium min-w-0">Email:</span>
                    <span className="text-gray-200 break-all sm:truncate">{u.email}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-sm">
                    <span className="text-gray-400 font-medium">Inscrit le:</span>
                    <span className="text-gray-200">
                      {new Date(u.createdAt).toLocaleDateString("fr-FR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric"
                      })}
                    </span>
                  </div>
                </div>

                {/* Actions principales */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Link
                    href={`/admin/users/${u.id}`}
                    className="rounded-lg bg-[#8F60D0] hover:bg-[#A855F7] px-4 py-3 text-sm text-white text-center font-medium transition-colors"
                  >
                    ⚙️ Gérer l'utilisateur
                  </Link>
                  <Link
                    href={`/profil/${u.pseudo}`}
                    className="rounded-lg border border-[#2a2c30] hover:border-[#8F60D0] hover:bg-[#8F60D0]/10 px-4 py-3 text-sm text-center transition-colors"
                  >
                    👤 Voir le profil
                  </Link>
                </div>

                {/* Actions secondaires */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <form
                    method="POST"
                    action={`/api/admin/users/${u.id}/toggle-role`}
                    className="w-full"
                  >
                    <button
                      className={`w-full rounded-lg border px-4 py-2.5 text-sm transition-colors min-h-[42px] flex items-center justify-center ${
                        isSelf
                          ? "border-[#2a2c30] text-gray-500 cursor-not-allowed opacity-60"
                          : u.role === "ADMIN"
                          ? "border-blue-600/50 text-blue-300 hover:border-blue-500 hover:bg-blue-600/10"
                          : "border-purple-600/50 text-purple-300 hover:border-purple-500 hover:bg-purple-600/10"
                      }`}
                      disabled={isSelf}
                      title={isSelf ? "Vous ne pouvez pas changer votre propre rôle" : "Changer le rôle"}
                    >
                      {u.role === "ADMIN" ? "↓ Changer en USER" : "↑ Changer en ADMIN"}
                    </button>
                  </form>

                  <form
                    method="POST"
                    action={`/api/admin/users/${u.id}/toggle-delete`}
                    className="w-full"
                  >
                    <button
                      className={`w-full rounded-lg px-4 py-2.5 text-sm border transition-colors min-h-[42px] flex items-center justify-center ${
                        isSelf
                          ? "border-[#2a2c30] text-gray-500 cursor-not-allowed opacity-60"
                          : u.isDeleted
                          ? "border-green-600/50 text-green-300 hover:border-green-500 hover:bg-green-600/10"
                          : "border-red-600/50 text-red-300 hover:border-red-500 hover:bg-red-600/10"
                      }`}
                      disabled={isSelf}
                      title={
                        isSelf
                          ? "Vous ne pouvez pas vous supprimer"
                          : u.isDeleted
                          ? "Restaurer l'utilisateur"
                          : "Supprimer l'utilisateur"
                      }
                    >
                      {u.isDeleted ? "🔄 Restaurer l'utilisateur" : "🗑️ Supprimer l'utilisateur"}
                    </button>
                  </form>
                </div>

                {/* Avertissement pour soi-même */}
                {isSelf && (
                  <div className="text-sm text-amber-400 bg-amber-600/10 border border-amber-600/30 rounded-lg px-3 py-2 text-center">
                    ⚠️ Votre propre compte - Actions limitées
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {rows.length === 0 && (
          <div className="rounded-xl bg-[#1c1d1f] border border-[#2a2c30] p-8 text-center text-gray-400">
            <div className="text-4xl mb-3">👤</div>
            <div className="font-medium text-lg mb-2">Aucun utilisateur trouvé</div>
            <div className="text-sm text-gray-500">Essayez de modifier vos filtres de recherche</div>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="space-y-4">
          <div className="text-center text-base text-gray-400">
            Page {page} sur {pages} • {total} résultat{total > 1 ? 's' : ''}
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-2 text-base">
            {/* Bouton précédent */}
            {page > 1 && (
              <Link
                href={`/admin/users?${buildQS({
                  q,
                  p: String(page - 1),
                  show: showAll ? "all" : undefined,
                })}`}
                className="rounded-lg px-4 py-2 border border-[#2a2c30] text-gray-400 hover:border-[#8F60D0] hover:text-[#8F60D0] transition-colors"
              >
                ← Précédent
              </Link>
            )}

            {/* Pages */}
            {Array.from({ length: Math.min(pages, 7) }, (_, i) => {
              let pageNum;
              if (pages <= 7) {
                pageNum = i + 1;
              } else if (page <= 4) {
                pageNum = i + 1;
              } else if (page >= pages - 3) {
                pageNum = pages - 6 + i;
              } else {
                pageNum = page - 3 + i;
              }

              if (pageNum < 1 || pageNum > pages) return null;

              const href = `/admin/users?${buildQS({
                q,
                p: String(pageNum),
                show: showAll ? "all" : undefined,
              })}`;
              const isActive = pageNum === page;
              
              return (
                <Link
                  key={pageNum}
                  href={href}
                  className={`rounded-lg px-4 py-2 border transition-colors min-w-[44px] text-center ${
                    isActive
                      ? "border-[#8F60D0] text-[#8F60D0] bg-[#8F60D0]/10 font-medium"
                      : "border-[#2a2c30] text-gray-400 hover:border-[#8F60D0] hover:text-[#8F60D0]"
                  }`}
                >
                  {pageNum}
                </Link>
              );
            })}

            {/* Bouton suivant */}
            {page < pages && (
              <Link
                href={`/admin/users?${buildQS({
                  q,
                  p: String(page + 1),
                  show: showAll ? "all" : undefined,
                })}`}
                className="rounded-lg px-4 py-2 border border-[#2a2c30] text-gray-400 hover:border-[#8F60D0] hover:text-[#8F60D0] transition-colors"
              >
                Suivant →
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
