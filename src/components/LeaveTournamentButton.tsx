"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";

export default function LeaveTournamentButton({
  tournoiId,
  userId,
}: {
  tournoiId: number;
  userId?: number;
}) {
  const [isLeaving, setIsLeaving] = useState(false);
  const router = useRouter();

  const handleLeave = async () => {
    if (isLeaving) return;
    setIsLeaving(true);
    try {
      const res = await fetch(`/api/tournament/${tournoiId}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "leave",
          userId,
        }),
      });
      if (res.ok) {
        router.refresh();
      } else {
        console.error("Erreur lors du quit");
      }
    } catch (error) {
      console.error("Erreur reseau :", error);
    }
    setIsLeaving(false);
  };

  return (
    <button
      onClick={handleLeave}
      disabled={isLeaving}
      aria-busy={isLeaving}
      className="cursor-pointer absolute top-2 right-2 z-10 rounded border border-rose-500/40 bg-black/30 px-1.5 py-1 text-rose-300 transition hover:border-rose-400 hover:text-rose-200 disabled:cursor-not-allowed disabled:opacity-60"
      title="Exclure du tournoi"
      aria-label="Quitter le tournoi"
    >
      <X className="h-4 w-4" />
    </button>
  );
}
