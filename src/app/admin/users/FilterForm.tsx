"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

export default function FilterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentQ = searchParams.get("q") ?? "";
  const currentShow = searchParams.get("show") ?? "all";

  const updateFilters = useCallback((updates: Record<string, string>) => {
    const params = new URLSearchParams();
    
    // Obtenir les valeurs actuelles
    const q = updates.q ?? currentQ;
    const show = updates.show ?? currentShow;
    
    if (q.trim()) params.set("q", q.trim());
    if (show) params.set("show", show);
    
    const query = params.toString();
    router.push(`/admin/users${query ? `?${query}` : ""}`);
  }, [router, currentQ, currentShow]);

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
      <button
        onClick={() => updateFilters({ show: currentShow === "all" ? "active" : "all" })}
        className="text-xs sm:text-sm rounded-lg border border-[#2a2c30] px-3 py-2 hover:border-[#8F60D0] transition-colors whitespace-nowrap"
      >
        {currentShow === "all" ? "Masquer les supprimés" : "Afficher les supprimés"}
      </button>

      <input
        value={currentQ}
        onChange={(e) => updateFilters({ q: e.target.value })}
        placeholder="Rechercher email ou pseudo"
        className="w-full sm:w-auto rounded-xl bg-[#1c1d1f] border border-[#2a2c30] px-3 py-2 text-sm outline-none focus:border-[#8F60D0] text-white placeholder:text-gray-500"
        aria-label="Recherche"
      />
    </div>
  );
}
