"use client";

import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, Suspense, useState } from "react";
import Link from "next/link";

const PAGE_SIZE = 10;

function buildQS(params: Record<string, string | undefined>) {
  const usp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v && v.length > 0) usp.set(k, v);
  });
  return usp.toString();
}

function getStatusColor(status: string) {
  switch (status) {
    case "completed":
      return "bg-green-900/30 text-green-300";
    case "pending":
      return "bg-yellow-900/30 text-yellow-300";
    case "failed":
      return "bg-red-900/30 text-red-300";
    case "active":
      return "bg-green-900/30 text-green-300";
    default:
      return "bg-gray-900/30 text-gray-300";
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case "completed":
      return "Complété";
    case "pending":
      return "En attente";
    case "failed":
      return "Échoué";
    case "active":
      return "Actif";
    default:
      return status;
  }
}

function AdminPaymentsContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [payments, setPayments] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "loading") return;
    if (!session || (session.user && session.user.role !== "ADMIN")) {
      router.push("/");
    }
  }, [session, status, router]);

  useEffect(() => {
    // fetch admin payments (users with active plans)
    let mounted = true;
    fetch("/api/admin/payments")
      .then((r) => r.json())
      .then((data) => {
        if (!mounted) return;
        if (Array.isArray(data)) {
          setPayments(data);
        } else if (data?.payments) {
          setPayments(data.payments);
        } else {
          setPayments([]);
        }
      })
      .catch((err) => {
        console.error(err);
        setError(err?.message ?? "Erreur lors de la récupération des données");
      });
    return () => {
      mounted = false;
    };
  }, []);

  if (status === "loading") {
    return <div className="text-center text-white py-10">Chargement...</div>;
  }

  if (!session || session.user.role !== "ADMIN") {
    return null;
  }

  const q = (searchParams.get("q") ?? "").trim();
  const pNum = Number(searchParams.get("p") ?? "1");
  const page = Number.isFinite(pNum) && pNum > 0 ? pNum : 1;
  const statusFilter = searchParams.get("status") ?? "all";

  const allPayments = payments ?? [];

  // filter
  let filteredPayments = allPayments;
  if (statusFilter !== "all") {
    filteredPayments = filteredPayments.filter((p) => p.status === statusFilter);
  }
  if (q) {
    const qlc = q.toLowerCase();
    filteredPayments = filteredPayments.filter((p) =>
      (p.userName ?? "").toLowerCase().includes(qlc) ||
      (p.transactionId ?? "").toLowerCase().includes(qlc) ||
      (p.plan?.name ?? "").toLowerCase().includes(qlc)
    );
  }

  const total = filteredPayments.length;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const startIndex = (page - 1) * PAGE_SIZE;
  const paymentsPage = filteredPayments.slice(startIndex, startIndex + PAGE_SIZE);

  // stats
  const totalRevenue = allPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const pendingPayments = allPayments.filter((p) => p.status === "pending").length;
  const completedPayments = allPayments.filter((p) => p.status === "completed" || p.status === "active").length;
  const failedPayments = allPayments.filter((p) => p.status === "failed").length;

  return (
    <div className="space-y-6">
      {!!searchParams.get("ok") && (
        <div className="rounded-lg border border-green-500/30 bg-green-500/10 text-green-200 px-3 py-2 text-sm">
          {searchParams.get("ok")}
        </div>
      )}
      {!!searchParams.get("err") && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 text-red-200 px-3 py-2 text-sm">
          Erreur : {searchParams.get("err")}
        </div>
      )}

      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-bold">Gestion des Abonnements</h1>
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-[#1c1d1f] border border-[#2a2c30] px-3 py-2 text-sm text-green-400">
            💰 Revenus estimés: {totalRevenue.toFixed(2)} €
          </div>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-2 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl p-3 sm:p-4 bg-[#1c1d1f] shadow border border-[#2a2c30]">
          <p className="text-xs uppercase tracking-wider text-gray-400">Abonnements actifs</p>
          <p className="mt-2 text-xl sm:text-2xl font-bold text-green-400">{completedPayments}</p>
        </div>
        <div className="rounded-2xl p-3 sm:p-4 bg-[#1c1d1f] shadow border border-[#2a2c30]">
          <p className="text-xs uppercase tracking-wider text-gray-400">En attente</p>
          <p className="mt-2 text-xl sm:text-2xl font-bold text-yellow-400">{pendingPayments}</p>
        </div>
        <div className="rounded-2xl p-3 sm:p-4 bg-[#1c1d1f] shadow border border-[#2a2c30]">
          <p className="text-xs uppercase tracking-wider text-gray-400">Échoués</p>
          <p className="mt-2 text-xl sm:text-2xl font-bold text-red-400">{failedPayments}</p>
        </div>
        <div className="rounded-2xl p-3 sm:p-4 bg-[#1c1d1f] shadow border border-[#2a2c30]">
          <p className="text-xs uppercase tracking-wider text-gray-400">Revenus totaux</p>
          <p className="mt-2 text-xl sm:text-2xl font-bold text-[#8F60D0]">{totalRevenue.toFixed(2)} €</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <form action="/admin/paiements" method="GET" className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <select
            name="status"
            defaultValue={statusFilter}
            className="w-full sm:w-auto rounded-lg bg-[#1c1d1f] border border-[#2a2c30] px-3 py-2 text-sm outline-none focus:border-[#8F60D0] text-white"
          >
            <option value="all">Tous les statuts</option>
            <option value="active">Actifs</option>
            <option value="pending">En attente</option>
            <option value="failed">Échoués</option>
          </select>

          <input
            name="q"
            defaultValue={q}
            placeholder="Rechercher un utilisateur, plan..."
            className="w-full sm:w-auto rounded-xl bg-[#1c1d1f] border border-[#2a2c30] px-3 py-2 text-sm outline-none focus:border-[#8F60D0] text-white placeholder:text-gray-500"
            aria-label="Recherche"
          />
          <button
            type="submit"
            className="w-full sm:w-auto rounded-lg bg-[#8F60D0] hover:bg-[#A855F7] px-4 py-2 text-sm font-medium"
          >
            Filtrer
          </button>
        </form>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 text-red-200 px-3 py-2 text-sm">{error}</div>
      )}

      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto rounded-2xl border border-[#2a2c30]">
        <table className="min-w-full text-sm">
          <thead className="bg-[#1c1d1f]">
            <tr className="text-left text-gray-300">
              <th className="p-3">ID</th>
              <th className="p-3">Utilisateur</th>
              <th className="p-3">Abonnement</th>
              <th className="p-3">Montant</th>
              <th className="p-3">Méthode</th>
              <th className="p-3">Transaction</th>
              <th className="p-3">Statut</th>
              <th className="p-3">Date</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paymentsPage.map((payment) => (
              <tr key={payment.id} className="border-t border-[#2a2c30]">
                <td className="p-3 text-gray-400">{payment.id}</td>
                <td className="p-3">
                  <div className="font-medium text-white">{payment.userName}</div>
                  <div className="text-xs text-gray-400">{payment.userEmail}</div>
                </td>
                <td className="p-3">
                  <div className="text-white">{payment.plan?.name ?? "-"}</div>
                  <div className="text-xs text-gray-400">{payment.plan?.slug ?? ""}</div>
                </td>
                <td className="p-3">
                  <span className="font-medium text-white">{(Number(payment.amount) || 0).toFixed(2)} {payment.currency}</span>
                </td>
                <td className="p-3">
                  <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-[#232426] text-gray-300">{payment.paymentMethod}</span>
                </td>
                <td className="p-3">
                  <code className="text-xs text-gray-300 bg-[#232426] px-2 py-1 rounded">{payment.transactionId ?? "-"}</code>
                </td>
                <td className="p-3">
                  <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(payment.status)}`}>{getStatusLabel(payment.status)}</span>
                </td>
                <td className="p-3 text-gray-400">{new Date(payment.createdAt).toLocaleString("fr-FR")}</td>
                <td className="p-3 text-right space-x-2">
                  {/* Admin actions: view user */}
                  <Link href={`/profil/${payment.userName}`} className="rounded-lg border border-[#2a2c30] hover:border-[#8F60D0] px-3 py-1.5 text-xs">Voir profil</Link>

                  <button
                    className="rounded-lg border border-blue-600/40 text-blue-300 hover:border-blue-500 hover:text-blue-200 px-3 py-1.5 text-xs"
                    onClick={async () => {
                      if (!confirm('Annuler cet abonnement pour cet utilisateur ?')) return;
                      try {
                        const res = await fetch('/api/admin/payments/action', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ userId: payment.userId, action: 'cancel' }),
                        });
                        const data = await res.json();
                        if (!res.ok) throw new Error(data?.error || 'Erreur serveur');
                        // remove locally
                        setPayments((prev) => (prev ? prev.filter((p) => p.userId !== payment.userId) : prev));
                        alert('Abonnement annulé (local).');
                      } catch (e: any) {
                        console.error(e);
                        alert('Erreur: ' + (e?.message ?? 'Erreur inconnue'));
                      }
                    }}
                  >Action</button>
                </td>
              </tr>
            ))}
            {paymentsPage.length === 0 && (
              <tr>
                <td colSpan={9} className="p-6 text-center text-gray-400">Aucun abonnement trouvé.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-4">
        {paymentsPage.map((payment) => {
          const statusColor = payment.status === "active" || payment.status === "completed" ? "bg-green-800 text-green-200" : payment.status === "pending" ? "bg-yellow-800 text-yellow-200" : payment.status === "failed" ? "bg-red-800 text-red-200" : "bg-blue-800 text-blue-200";
          const statusLabel = getStatusLabel(payment.status);
          return (
            <div key={payment.id} className="rounded-2xl bg-[#1c1d1f] border border-[#2a2c30] p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg font-medium text-white">#{payment.id}</span>
                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${statusColor}`}>{statusLabel}</span>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div><span className="text-gray-400">Utilisateur:</span><span className="text-white ml-1">{payment.userName}</span></div>
                    <div><span className="text-gray-400">Abonnement:</span><span className="text-white ml-1">{payment.plan?.name ?? "-"}</span></div>
                    <div><span className="text-gray-400">Montant:</span><span className="text-green-400 font-medium ml-1">{(Number(payment.amount)||0).toFixed(2)} €</span></div>
                    <div><span className="text-gray-400">Date:</span><span className="text-white ml-1">{new Date(payment.createdAt).toLocaleString("fr-FR")}</span></div>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button className="flex-1 rounded-lg border border-[#2a2c30] px-3 py-2 text-sm" onClick={() => alert('Voir profil')}>Profil</button>
                <button className="flex-1 rounded-lg border border-blue-600/40 text-blue-300 px-3 py-2 text-sm" onClick={() => alert('Action admin')}>Action</button>
              </div>
            </div>
          );
        })}
        {paymentsPage.length === 0 && (
          <div className="rounded-2xl bg-[#1c1d1f] border border-[#2a2c30] p-6 text-center text-gray-400">Aucun abonnement trouvé.</div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex flex-wrap items-center justify-center gap-2 text-sm">
        {Array.from({ length: pages }, (_, i) => i + 1).map((n) => {
          const href = `/admin/paiements?${buildQS({ q, p: String(n), status: statusFilter !== "all" ? statusFilter : undefined })}`;
          const isActive = n === page;
          return (
            <Link key={n} href={href} className={`rounded-lg px-3 py-2 border transition-colors ${isActive ? "border-[#8F60D0] text-[#8F60D0] bg-[#8F60D0]/10" : "border-[#2a2c30] text-gray-400 hover:border-[#8F60D0] hover:text-[#8F60D0]"}`}>
              {n}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default function AdminPayments() {
  return (
    <Suspense fallback={<div className="text-center text-white py-10">Chargement...</div>}>
      <AdminPaymentsContent />
    </Suspense>
  );
}
