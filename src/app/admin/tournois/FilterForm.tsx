"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

const GAME_LABELS: Record<string, string> = {
  LEAGUE_OF_LEGENDS: "League of Legends",
  VALORANT: "Valorant",
  OVERWATCH: "Overwatch",
  FALL_GUYS: "Fall Guys",
  MARVELS_RIVALS: "Marvel's Rivals",
  MINECRAFT: "Minecraft",
};

export default function FilterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentStatus = searchParams.get("status") ?? "all";
  const currentGame = searchParams.get("game") ?? "all";
  const currentQ = searchParams.get("q") ?? "";

  const updateFilters = useCallback((updates: Record<string, string>) => {
    const params = new URLSearchParams();
    
    // Obtenir les valeurs actuelles
    const status = updates.status ?? currentStatus;
    const game = updates.game ?? currentGame;
    const q = updates.q ?? currentQ;
    
    if (status !== "all") params.set("status", status);
    if (game !== "all") params.set("game", game);
    if (q.trim()) params.set("q", q.trim());
    
    const query = params.toString();
    router.push(`/admin/tournois${query ? `?${query}` : ""}`);
  }, [router, currentStatus, currentGame, currentQ]);

  return (
    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
      <select
        value={currentStatus}
        onChange={(e) => updateFilters({ status: e.target.value })}
        className="w-full sm:w-auto rounded-lg bg-[#1c1d1f] border border-[#2a2c30] px-3 py-2 text-sm outline-none focus:border-[#8F60D0] text-white"
      >
        <option value="all">Tous les statuts</option>
        <option value="active">Actifs</option>
        <option value="finished">Terminés</option>
        <option value="deleted">Supprimés</option>
      </select>

      <select
        value={currentGame}
        onChange={(e) => updateFilters({ game: e.target.value })}
        className="w-full sm:w-auto rounded-lg bg-[#1c1d1f] border border-[#2a2c30] px-3 py-2 text-sm outline-none focus:border-[#8F60D0] text-white"
      >
        <option value="all">Tous les jeux</option>
        {Object.entries(GAME_LABELS).map(([key, label]) => (
          <option key={key} value={key}>
            {label}
          </option>
        ))}
      </select>

      <input
        value={currentQ}
        onChange={(e) => updateFilters({ q: e.target.value })}
        placeholder="Rechercher un tournoi..."
        className="w-full sm:w-auto rounded-xl bg-[#1c1d1f] border border-[#2a2c30] px-3 py-2 text-sm outline-none focus:border-[#8F60D0] text-white placeholder:text-gray-500"
        aria-label="Recherche"
      />
    </div>
  );
}
