"use client";

import { useEffect, useState } from "react";
import { useDialog } from "@/components/DialogProvider";

interface Contact {
  id: number;
  message: string;
  status: "EN_COURS" | "TRAITE";
  createdAt: string;
  user: {
    id: number;
    pseudo: string;
    email: string;
  };
}

export default function AdminMessagesPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "EN_COURS" | "TRAITE">("all");
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const { alert } = useDialog();

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const res = await fetch("/api/admin/contacts");
        const data = await res.json();
        if (Array.isArray(data?.contacts)) {
          setContacts(data.contacts);
        }
      } catch {
        await alert({
          title: "Erreur",
          description: "Impossible de charger les messages.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchContacts();
  }, [alert]);

  const toggleStatus = async (contact: Contact) => {
    const newStatus = contact.status === "EN_COURS" ? "TRAITE" : "EN_COURS";
    setUpdatingId(contact.id);
    try {
      const res = await fetch(`/api/admin/contacts/${contact.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setContacts((prev) =>
          prev.map((c) => (c.id === contact.id ? { ...c, status: newStatus } : c)),
        );
      } else {
        const err = await res.json();
        await alert({
          title: "Erreur",
          description: err.error || "Impossible de mettre à jour le statut.",
        });
      }
    } catch {
      await alert({
        title: "Erreur",
        description: "Erreur réseau.",
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered =
    filter === "all" ? contacts : contacts.filter((c) => c.status === filter);

  const countEnCours = contacts.filter((c) => c.status === "EN_COURS").length;
  const countTraite = contacts.filter((c) => c.status === "TRAITE").length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8F60D0]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Messages de contact</h1>
          <p className="text-base text-white mt-1">
            {contacts.length} message{contacts.length > 1 ? "s" : ""} au total
            {countEnCours > 0 && (
              <span className="ml-2 text-yellow-400">
                • {countEnCours} en cours
              </span>
            )}
          </p>
        </div>

        {/* Filtres */}
        <div className="flex gap-2">
          {(["all", "EN_COURS", "TRAITE"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors cursor-pointer ${
                filter === f
                  ? "bg-[#8F60D0] text-white"
                  : "bg-[#1c1d1f] text-white hover:text-white"
              }`}
            >
              {f === "all" ? "Tous" : f === "EN_COURS" ? "En cours" : "Traités"}
              <span className="ml-1 text-xs opacity-75">
                ({f === "all" ? contacts.length : f === "EN_COURS" ? countEnCours : countTraite})
              </span>
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center text-white py-16">
          Aucun message {filter === "EN_COURS" ? "en cours" : filter === "TRAITE" ? "traité" : ""}.
        </div>
      ) : (
        <>
          {/* Tableau desktop */}
          <div className="hidden lg:block overflow-x-auto rounded-2xl border border-[#2a2c30]">
            <table className="min-w-full text-base">
              <thead className="bg-[#1c1d1f]">
                <tr className="text-left text-white">
                  <th className="p-4 text-base font-medium">ID</th>
                  <th className="p-4 text-base font-medium">Utilisateur</th>
                  <th className="p-4 text-base font-medium">Email</th>
                  <th className="p-4 text-base font-medium">Message</th>
                  <th className="p-4 text-base font-medium">Date</th>
                  <th className="p-4 text-base font-medium">Statut</th>
                  <th className="p-4 text-right text-base font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id} className="border-t border-[#2a2c30]">
                    <td className="p-4 text-white">{c.id}</td>
                    <td className="p-4 font-medium">{c.user.pseudo}</td>
                    <td className="p-4 text-white">{c.user.email}</td>
                    <td className="p-4 max-w-md">
                      <p className="whitespace-pre-wrap break-words" title={c.message}>
                        {c.message || <span className="text-white italic">Aucun message</span>}
                      </p>
                    </td>
                    <td className="p-4 text-white whitespace-nowrap">
                      {new Date(c.createdAt).toLocaleDateString("fr-FR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                          c.status === "EN_COURS"
                            ? "bg-yellow-500/15 text-yellow-400"
                            : "bg-green-500/15 text-green-400"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            c.status === "EN_COURS" ? "bg-yellow-400" : "bg-green-400"
                          }`}
                        />
                        {c.status === "EN_COURS" ? "En cours" : "Traité"}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => toggleStatus(c)}
                        disabled={updatingId === c.id}
                        className={`px-3 py-1.5 rounded-lg text-sm transition-colors cursor-pointer disabled:opacity-50 ${
                          c.status === "EN_COURS"
                            ? "bg-green-600 hover:bg-green-700 text-white"
                            : "bg-yellow-600 hover:bg-yellow-700 text-white"
                        }`}
                      >
                        {updatingId === c.id
                          ? "..."
                          : c.status === "EN_COURS"
                            ? "✓ Marquer traité"
                            : "↩ Remettre en cours"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Cards mobile */}
          <div className="lg:hidden space-y-3">
            {filtered.map((c) => (
              <div
                key={c.id}
                className="rounded-xl border border-[#2a2c30] bg-[#1c1d1f] p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium">{c.user.pseudo}</span>
                    <span className="text-white text-sm ml-2">#{c.id}</span>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                      c.status === "EN_COURS"
                        ? "bg-yellow-500/15 text-yellow-400"
                        : "bg-green-500/15 text-green-400"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        c.status === "EN_COURS" ? "bg-yellow-400" : "bg-green-400"
                      }`}
                    />
                    {c.status === "EN_COURS" ? "En cours" : "Traité"}
                  </span>
                </div>
                <p className="text-white text-sm">{c.user.email}</p>
                <p className="text-sm text-white bg-[#232426] rounded-lg p-3">{c.message}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white">
                    {new Date(c.createdAt).toLocaleDateString("fr-FR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  <button
                    onClick={() => toggleStatus(c)}
                    disabled={updatingId === c.id}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-colors cursor-pointer disabled:opacity-50 ${
                      c.status === "EN_COURS"
                        ? "bg-green-600 hover:bg-green-700 text-white"
                        : "bg-yellow-600 hover:bg-yellow-700 text-white"
                    }`}
                  >
                    {updatingId === c.id
                      ? "..."
                      : c.status === "EN_COURS"
                        ? "✓ Marquer traité"
                        : "↩ Remettre en cours"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
