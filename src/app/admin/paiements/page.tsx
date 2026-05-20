"use client";

import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, Suspense, useState } from "react";
import { useDialog } from "@/components/DialogProvider";
import Link from "next/link";

const PAGE_SIZE = 10;
const DEFAULT_TOKENS_PER_MONTH = 3;

type PaymentPlan = {
  id: number;
  name: string;
  slug?: string;
  priceCents?: number;
  currency?: string;
  tokensPerMonth: number;
};

type Payment = {
  id: number;
  userId: number;
  userName?: string | null;
  userEmail?: string | null;
  plan?: PaymentPlan | null;
  amount?: number | null;
  currency?: string | null;
  status?: string | null;
  paymentMethod?: string | null;
  transactionId?: string | null;
  subscriptionId?: string | null;
  createdAt?: string | null;
};

type Plan = {
  id: number;
  name: string;
  slug?: string;
  priceCents: number;
  currency?: string;
  tokensPerMonth: number;
};

// Helper pour construire proprement une query string
function buildQS(params: Record<string, string | undefined>) {
  const usp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v && v.length > 0) usp.set(k, v);
  });
  return usp.toString();
}

// Définit la couleur d'un statut
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
    case "inactive":
      return "bg-gray-900/30 text-white";
    default:
      return "bg-gray-900/30 text-white";
  }
}

// Permet de rendre un label de statut.
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
    case "inactive":
      return "Inactif";
    default:
      return status;
  }
}

// Permet d'afficher le contenu de la page paiements.
function AdminPaymentsContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { confirm, alert } = useDialog();

  const [payments, setPayments] = useState<Payment[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [plansError, setPlansError] = useState<string | null>(null);
  const [plansLoading, setPlansLoading] = useState(true);
  const [planSelections, setPlanSelections] = useState<Record<number, number>>({});
  const [planActionLoading, setPlanActionLoading] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (status === "loading") return;
    if (!session || (session.user && !["ADMIN", "SUPER_ADMIN"].includes(session.user.role))) {
      router.push("/");
    }
  }, [session, status, router]);

  useEffect(() => {
    // Recuperer les paiements admin (utilisateurs avec plan actif)
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
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Erreur lors de la récupération des données");
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    fetch("/api/plans")
      .then((r) => r.json())
      .then((data) => {
        if (!mounted) return;
        if (Array.isArray(data)) {
          setPlans(data);
        } else if (Array.isArray(data?.plans)) {
          setPlans(data.plans);
        } else {
          setPlans([]);
        }
      })
      .catch((err: unknown) => {
        if (!mounted) return;
        setPlansError(err instanceof Error ? err.message : "Erreur lors de la récupération des plans");
      })
      .finally(() => {
        if (!mounted) return;
        setPlansLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  if (status === "loading") {
    return <div className="text-center text-white py-10">Chargement...</div>;
  }

  if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
    return null;
  }
  const isSuperAdmin = session.user.role === "SUPER_ADMIN";

  const q = (searchParams.get("q") ?? "").trim();
  const pNum = Number(searchParams.get("p") ?? "1");
  const page = Number.isFinite(pNum) && pNum > 0 ? pNum : 1;
  const planFilter = searchParams.get("plan") ?? "all";

  const allPayments = payments ?? [];

  // Filtre
  let filteredPayments = allPayments;
  if (planFilter !== "all") {
    if (planFilter === "free") {
      filteredPayments = filteredPayments.filter((p) => !p.plan);
    } else {
      const planId = Number(planFilter);
      if (Number.isFinite(planId)) {
        filteredPayments = filteredPayments.filter((p) => p.plan?.id === planId);
      }
    }
  }
  if (q) {
    const qlc = q.toLowerCase();
    filteredPayments = filteredPayments.filter(
      (p) =>
        (p.userName ?? "").toLowerCase().includes(qlc) ||
        (p.transactionId ?? "").toLowerCase().includes(qlc) ||
        (p.subscriptionId ?? "").toLowerCase().includes(qlc) ||
        (p.plan?.name ?? "").toLowerCase().includes(qlc),
    );
  }

  const total = filteredPayments.length;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const startIndex = (page - 1) * PAGE_SIZE;
  const paymentsPage = filteredPayments.slice(startIndex, startIndex + PAGE_SIZE);

  // Stats
  const totalRevenue = allPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const pendingPayments = allPayments.filter((p) => p.status === "pending").length;
  const completedPayments = allPayments.filter(
    (p) => p.status === "completed" || p.status === "active",
  ).length;
  const failedPayments = allPayments.filter((p) => p.status === "failed").length;
  const paidPlans = plans.filter((plan) => Number(plan.priceCents) > 0);
  const freeCount = allPayments.filter((p) => !p.plan).length;
  const planCounts = [
    {
      id: "free",
      name: "Plan gratuit",
      tokensPerMonth: DEFAULT_TOKENS_PER_MONTH,
      count: freeCount,
    },
    ...paidPlans.map((plan) => ({
      id: plan.id,
      name: plan.name,
      tokensPerMonth: plan.tokensPerMonth,
      count: allPayments.filter((p) => p.plan?.id === plan.id).length,
    })),
  ];
  const planButtons = [
    { id: "all", name: "Tous les plans" },
    ...planCounts.map((plan) => ({ id: String(plan.id), name: plan.name })),
  ];

  const handlePlanSelection = (userId: number, planId: number) => {
    setPlanSelections((prev) => ({ ...prev, [userId]: planId }));
  };

  const handleChangePlan = async (payment: Payment, planId: number) => {
    if (!isSuperAdmin) {
      await alert({
        title: "Action non autorisée",
        description: "Seul le super admin peut gérer les abonnements des utilisateurs.",
      });
      return;
    }
    if (!planId || planId === payment.plan?.id) return;
    const ok = await confirm({
      title: "Changer le forfait",
      description: "Le nouveau forfait sera appliqué immédiatement.",
      confirmText: "Confirmer",
      cancelText: "Annuler",
    });
    if (!ok) return;

    setPlanActionLoading((prev) => ({ ...prev, [payment.userId]: true }));
    try {
      const res = await fetch("/api/admin/payments/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: payment.userId, action: "change_plan", planId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Erreur serveur");

      const nextPlan = plans.find((plan) => plan.id === planId) ?? data.plan;
      if (nextPlan) {
        setPayments((prev) =>
          prev
            ? prev.map((p) =>
                p.userId === payment.userId
                  ? {
                      ...p,
                      plan: {
                        id: nextPlan.id,
                        name: nextPlan.name,
                        slug: nextPlan.slug,
                        priceCents: nextPlan.priceCents,
                        currency: nextPlan.currency,
                        tokensPerMonth: nextPlan.tokensPerMonth,
                      },
                      amount: Number(nextPlan.priceCents || 0) / 100,
                      currency: nextPlan.currency ?? p.currency,
                      status: "active",
                      paymentMethod: "PayPal (via abonnement)",
                    }
                  : p,
              )
            : prev,
        );
        setPlanSelections((prev) => ({ ...prev, [payment.userId]: planId }));
      }

      await alert({
        title: "Forfait mis à jour",
        description: "Le forfait a été appliqué avec succès.",
      });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Erreur inconnue.";
      await alert({
        title: "Erreur",
        description: message,
      });
    } finally {
      setPlanActionLoading((prev) => ({ ...prev, [payment.userId]: false }));
    }
  };

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
      {!isSuperAdmin && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-200 px-3 py-2 text-sm">
          Vous êtes admin. La gestion des abonnements est réservée au super admin.
        </div>
      )}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Gestion des abonnements</h1>
          <p className="text-base text-white mt-1">
            {total} utilisateur{total > 1 ? "s" : ""} - {completedPayments} actif
            {completedPayments > 1 ? "s" : ""}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
          <div className="rounded-lg bg-[#1c1d1f] border border-[#2a2c30] px-3 py-2 text-sm text-green-400">
            Revenus estimés: {totalRevenue.toFixed(2)} EUR
          </div>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-2 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl p-3 sm:p-4 bg-[#1c1d1f] shadow border border-[#2a2c30]">
          <p className="text-xs uppercase tracking-wider text-white">Abonnements actifs</p>
          <p className="mt-2 text-xl sm:text-2xl font-bold text-green-400">{completedPayments}</p>
        </div>
        <div className="rounded-2xl p-3 sm:p-4 bg-[#1c1d1f] shadow border border-[#2a2c30]">
          <p className="text-xs uppercase tracking-wider text-white">En attente</p>
          <p className="mt-2 text-xl sm:text-2xl font-bold text-yellow-400">{pendingPayments}</p>
        </div>
        <div className="rounded-2xl p-3 sm:p-4 bg-[#1c1d1f] shadow border border-[#2a2c30]">
          <p className="text-xs uppercase tracking-wider text-white">Échoués</p>
          <p className="mt-2 text-xl sm:text-2xl font-bold text-red-400">{failedPayments}</p>
        </div>
        <div className="rounded-2xl p-3 sm:p-4 bg-[#1c1d1f] shadow border border-[#2a2c30]">
          <p className="text-xs uppercase tracking-wider text-white">Revenus totaux</p>
          <p className="mt-2 text-xl sm:text-2xl font-bold text-[#8F60D0]">
            {totalRevenue.toFixed(2)} EUR
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-white">Répartition par plan</h2>
        </div>
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-2 lg:grid-cols-4">
          {planCounts.map((plan) => (
            <div
              key={plan.id}
              className="rounded-2xl p-3 sm:p-4 bg-[#1c1d1f] shadow border border-[#2a2c30]"
            >
              <p className="text-xs uppercase tracking-wider text-white">{plan.name}</p>
              <p className="mt-2 text-xl sm:text-2xl font-bold text-[#8F60D0]">{plan.count}</p>
              <p className="text-xs text-white">{plan.tokensPerMonth} tokens/mois</p>
            </div>
          ))}
          {planCounts.length === 0 && (
            <div className="rounded-2xl p-3 sm:p-4 bg-[#1c1d1f] shadow border border-[#2a2c30] text-sm text-white">
              Aucun plan disponible.
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 text-red-200 px-3 py-2 text-sm">
          {error}
        </div>
      )}
      {plansError && (
        <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 text-yellow-200 px-3 py-2 text-sm">
          Plans: {plansError}
        </div>
      )}

      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          {planButtons.map((plan) => {
            const isActive =
              plan.id === "all" ? planFilter === "all" : String(plan.id) === planFilter;
            const href = `/admin/paiements?${buildQS({
              q: q || undefined,
              p: "1",
              plan: plan.id === "all" ? undefined : String(plan.id),
            })}`;
            return (
              <Link
                key={plan.id}
                href={href}
                className={`btn-neon rounded-lg px-4 py-2 text-sm border transition-colors ${
                  isActive
                    ? "border-[#8F60D0] text-[#8F60D0] bg-[#8F60D0]/10"
                    : "border-[#2a2c30] text-white hover:border-[#8F60D0] hover:text-white"
                }`}
              >
                {plan.name}
              </Link>
            );
          })}
        </div>
        <form
          action="/admin/paiements"
          method="GET"
          className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto"
        >
          {planFilter !== "all" && <input type="hidden" name="plan" value={planFilter} />}
          <input
            name="q"
            defaultValue={q}
            placeholder="Rechercher un utilisateur, plan..."
            className="w-full sm:w-auto rounded-xl bg-[#1c1d1f] border border-[#2a2c30] px-3 py-2 text-sm outline-none focus:border-[#8F60D0] text-white placeholder:text-gray-500"
            aria-label="Recherche"
          />
          <button
            type="submit"
            className="w-full sm:w-auto rounded-lg bg-[#8F60D0] hover:bg-[#A855F7] px-4 py-2 text-sm font-medium cursor-pointer"
          >
            Rechercher
          </button>
        </form>
      </div>

      {/* Tableau desktop */}
      <div className="admin-scroll hidden lg:block overflow-x-auto rounded-2xl border border-[#2a2c30]">
        <table className="min-w-full text-base">
          <thead className="bg-[#1c1d1f]">
            <tr className="text-left text-white">
              <th className="p-4 text-base font-medium">ID</th>
              <th className="p-4 text-base font-medium">Utilisateur</th>
              <th className="p-4 text-base font-medium">Abonnement</th>
              <th className="p-4 text-base font-medium">Montant</th>
              <th className="p-4 text-base font-medium">Méthode</th>
              <th className="p-4 text-base font-medium">Transaction</th>
              <th className="p-4 text-base font-medium">Statut</th>
              <th className="p-4 text-base font-medium">Date</th>
              <th className="p-4 text-right text-base font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paymentsPage.map((payment) => {
              const selectedPlanId = planSelections[payment.userId] ?? payment.plan?.id ?? 0;
              const isPlanLoading = !!planActionLoading[payment.userId];
              const canApplyPlan = !!selectedPlanId && selectedPlanId !== payment.plan?.id;
              const isFreePlan = !payment.plan || Number(payment.plan.priceCents ?? 0) === 0;
              return (
                <tr key={payment.id} className="border-t border-[#2a2c30]">
                  <td className="p-4 text-white">{payment.id}</td>
                  <td className="p-4">
                    <div className="font-medium text-white">{payment.userName}</div>
                    <div className="text-xs text-white">{payment.userEmail}</div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="text-white">{payment.plan?.name ?? "Plan gratuit"}</div>
                      {isFreePlan && (
                        <span className="inline-flex items-center rounded-full bg-gray-900/30 px-2 py-1 text-xs font-medium text-white">
                          Inactif
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-white">{payment.plan?.slug ?? "free"}</div>
                    <div className="text-xs text-white">
                      Tokens/mois: {payment.plan?.tokensPerMonth ?? DEFAULT_TOKENS_PER_MONTH}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="font-medium text-white">
                      {(Number(payment.amount) || 0).toFixed(2)} {payment.currency ?? "EUR"}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium bg-[#232426] text-white">
                      {payment.paymentMethod}
                    </span>
                  </td>
                  <td className="p-4">
                    <code className="text-xs text-white bg-[#232426] px-2 py-1 rounded">
                      {payment.transactionId ?? payment.subscriptionId ?? "-"}
                    </code>
                  </td>
                  <td className="p-4">
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(payment.status)}`}
                    >
                      {getStatusLabel(payment.status)}
                    </span>
                  </td>
                  <td className="p-4 text-white">
                    {new Date(payment.createdAt).toLocaleString("fr-FR")}
                  </td>
                  <td className="p-4 text-right space-x-2">
                    {/* Actions admin : voir l'utilisateur */}
                    <Link
                      href={`/profil/${payment.userName}`}
                      className="rounded-lg border border-[#2a2c30] hover:border-[#8F60D0] px-4 py-2 text-sm"
                    >
                      Voir profil
                    </Link>
                    <div className="inline-flex items-center gap-2 align-middle">
                      <select
                        value={selectedPlanId ? String(selectedPlanId) : ""}
                        onChange={(e) =>
                          handlePlanSelection(payment.userId, Number(e.target.value))
                        }
                        className="rounded-lg bg-[#1c1d1f] border border-[#2a2c30] px-3 py-2 text-sm outline-none focus:border-[#8F60D0] text-white"
                        disabled={plansLoading || plans.length === 0}
                      >
                        <option value="">Choisir un forfait</option>
                        {paidPlans.map((plan) => (
                          <option key={plan.id} value={plan.id}>
                            {plan.name} ({plan.tokensPerMonth} tokens)
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        className="rounded-lg border border-[#2a2c30] hover:border-[#8F60D0] px-4 py-2 text-sm text-[#8F60D0] disabled:opacity-50 cursor-pointer"
                        onClick={() => handleChangePlan(payment, selectedPlanId)}
                        disabled={!canApplyPlan || isPlanLoading}
                      >
                        {isPlanLoading ? "..." : "Appliquer"}
                      </button>
                    </div>

                    <button
                      className="rounded-lg border border-blue-600/40 text-blue-300 hover:border-blue-500 hover:text-blue-200 px-4 py-2 text-sm cursor-pointer"
                      onClick={async () => {
                        if (!isSuperAdmin) {
                          await alert({
                            title: "Action non autorisée",
                            description:
                              "Seul le super admin peut gérer les abonnements des utilisateurs.",
                          });
                          return;
                        }
                        const ok = await confirm({
                          title: "Annuler l'abonnement",
                          description: "L'abonnement sera annulé pour cet utilisateur.",
                          confirmText: "Annuler",
                          cancelText: "Garder",
                          variant: "danger",
                        });
                        if (!ok) return;
                        try {
                          const res = await fetch("/api/admin/payments/action", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ userId: payment.userId, action: "cancel" }),
                          });
                          const data = await res.json();
                          if (!res.ok) throw new Error(data?.error || "Erreur serveur");
                          // Retirer en local
                          setPayments((prev) =>
                            prev
                              ? prev.map((p) =>
                                  p.userId === payment.userId
                                    ? {
                                        ...p,
                                        plan: null,
                                        amount: 0,
                                        status: "inactive",
                                        paymentMethod: "Aucun",
                                        transactionId: null,
                                        subscriptionId: null,
                                      }
                                    : p,
                                )
                              : prev,
                          );
                          setPlanSelections((prev) => ({ ...prev, [payment.userId]: 0 }));
                          await alert({
                            title: "Abonnement annulé",
                            description: "L'abonnement a été annulé pour cet utilisateur.",
                          });
                        } catch (e: unknown) {
                          const message = e instanceof Error ? e.message : "Erreur inconnue.";
                          await alert({
                            title: "Erreur",
                            description: message,
                          });
                        }
                      }}
                    >
                      Annuler abonnement
                    </button>
                  </td>
                </tr>
              );
            })}
            {paymentsPage.length === 0 && (
              <tr>
                <td colSpan={9} className="p-6 text-center text-white">
                  Aucun abonnement trouvé.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Cartes mobile */}
      <div className="lg:hidden space-y-4">
        {paymentsPage.map((payment) => {
          const statusColor =
            payment.status === "active" || payment.status === "completed"
              ? "bg-green-800 text-green-200"
              : payment.status === "pending"
                ? "bg-yellow-800 text-yellow-200"
                : payment.status === "failed"
                  ? "bg-red-800 text-red-200"
                  : payment.status === "inactive"
                    ? "bg-gray-800 text-white"
                    : "bg-blue-800 text-blue-200";
          const statusLabel = getStatusLabel(payment.status);
          const selectedPlanId = planSelections[payment.userId] ?? payment.plan?.id ?? 0;
          const isPlanLoading = !!planActionLoading[payment.userId];
          const canApplyPlan = !!selectedPlanId && selectedPlanId !== payment.plan?.id;
          const isFreePlan = !payment.plan || Number(payment.plan.priceCents ?? 0) === 0;
          return (
            <div key={payment.id} className="rounded-2xl bg-[#1c1d1f] border border-[#2a2c30] p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg font-medium text-white">#{payment.id}</span>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${statusColor}`}
                    >
                      {statusLabel}
                    </span>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div>
                      <span className="text-white">Utilisateur:</span>
                      <span className="text-white ml-1">{payment.userName}</span>
                    </div>
                    <div>
                      <span className="text-white">Abonnement:</span>
                      <span className="ml-1 inline-flex items-center gap-2">
                        <span className="text-white">{payment.plan?.name ?? "Plan gratuit"}</span>
                        {isFreePlan && (
                          <span className="inline-flex items-center rounded-full bg-gray-900/30 px-2 py-1 text-xs font-medium text-white">
                            Inactif
                          </span>
                        )}
                      </span>
                    </div>
                    <div>
                      <span className="text-white">Tokens/mois:</span>
                      <span className="text-white ml-1">
                        {payment.plan?.tokensPerMonth ?? DEFAULT_TOKENS_PER_MONTH}
                      </span>
                    </div>
                    <div>
                      <span className="text-white">Subscription:</span>
                      <span className="text-white ml-1">{payment.subscriptionId ?? "-"}</span>
                    </div>
                    <div>
                      <span className="text-white">Montant:</span>
                      <span className="text-green-400 font-medium ml-1">
                        {(Number(payment.amount) || 0).toFixed(2)} {payment.currency ?? "EUR"}
                      </span>
                    </div>
                    <div>
                      <span className="text-white">Date:</span>
                      <span className="text-white ml-1">
                        {new Date(payment.createdAt).toLocaleString("fr-FR")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  <Link
                    href={`/profil/${payment.userName}`}
                    className="flex-1 rounded-lg border border-[#2a2c30] px-3 py-2 text-sm text-center"
                  >
                    Profil
                  </Link>
                  <button
                    className="flex-1 rounded-lg border border-blue-600/40 text-blue-300 px-3 py-2 text-sm cursor-pointer"
                    onClick={async () => {
                      if (!isSuperAdmin) {
                        await alert({
                          title: "Action non autorisée",
                          description:
                            "Seul le super admin peut gérer les abonnements des utilisateurs.",
                        });
                        return;
                      }
                      const ok = await confirm({
                        title: "Annuler l'abonnement",
                        description: "L'abonnement sera annulé pour cet utilisateur.",
                        confirmText: "Annuler",
                        cancelText: "Garder",
                        variant: "danger",
                      });
                      if (!ok) return;
                      try {
                        const res = await fetch("/api/admin/payments/action", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ userId: payment.userId, action: "cancel" }),
                        });
                        const data = await res.json();
                        if (!res.ok) throw new Error(data?.error || "Erreur serveur");
                        // Retirer en local
                        setPayments((prev) =>
                          prev
                            ? prev.map((p) =>
                                p.userId === payment.userId
                                  ? {
                                      ...p,
                                      plan: null,
                                      amount: 0,
                                      status: "inactive",
                                      paymentMethod: "Aucun",
                                      transactionId: null,
                                      subscriptionId: null,
                                    }
                                  : p,
                              )
                            : prev,
                        );
                        await alert({
                          title: "Abonnement annulé",
                          description: "L'abonnement a été annulé pour cet utilisateur.",
                        });
                      } catch (e: unknown) {
                        const message = e instanceof Error ? e.message : "Erreur inconnue.";
                        await alert({
                          title: "Erreur",
                          description: message,
                        });
                      }
                    }}
                  >
                    Annuler abonnement
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  <select
                    value={selectedPlanId ? String(selectedPlanId) : ""}
                    onChange={(e) => handlePlanSelection(payment.userId, Number(e.target.value))}
                    className="flex-1 rounded-lg bg-[#1c1d1f] border border-[#2a2c30] px-3 py-2 text-sm outline-none focus:border-[#8F60D0] text-white"
                    disabled={plansLoading || plans.length === 0}
                  >
                    <option value="">Choisir un forfait</option>
                    {paidPlans.map((plan) => (
                      <option key={plan.id} value={plan.id}>
                        {plan.name} ({plan.tokensPerMonth} tokens)
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="rounded-lg border border-[#2a2c30] hover:border-[#8F60D0] px-3 py-2 text-sm text-[#8F60D0] disabled:opacity-50 cursor-pointer"
                    onClick={() => handleChangePlan(payment, selectedPlanId)}
                    disabled={!canApplyPlan || isPlanLoading}
                  >
                    {isPlanLoading ? "..." : "Appliquer"}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        {paymentsPage.length === 0 && (
          <div className="rounded-2xl bg-[#1c1d1f] border border-[#2a2c30] p-6 text-center text-white">
            Aucun abonnement trouvé.
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex flex-wrap items-center justify-center gap-2 text-base">
        {Array.from({ length: pages }, (_, i) => i + 1).map((n) => {
          const href = `/admin/paiements?${buildQS({ q, p: String(n), plan: planFilter !== "all" ? planFilter : undefined })}`;
          const isActive = n === page;
          return (
            <Link
              key={n}
              href={href}
              className={`btn-neon rounded-lg px-4 py-2 border transition-colors min-w-11 text-center ${isActive ? "border-[#8F60D0] text-[#8F60D0] bg-[#8F60D0]/10 font-medium" : "border-[#2a2c30] text-white hover:border-[#8F60D0] hover:text-[#8F60D0]"}`}
            >
              {n}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

// Affiche la page des paiements admin
export default function AdminPayments() {
  return (
    <Suspense fallback={<div className="text-center text-white py-10">Chargement...</div>}>
      <AdminPaymentsContent />
    </Suspense>
  );
}
