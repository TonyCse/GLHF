"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { useDialog } from "@/components/DialogProvider";

// Bouton de suppression tournoi
export default function DeleteTournamentButton({
  id,
  textSize = "text-2xl",
}: {
  id: number;
  textSize?: string;
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { confirm, alert } = useDialog();

  const handleDelete = async () => {
    const ok = await confirm({
      title: "Supprimer le tournoi",
      description: "Cette action est définitive.",
      confirmText: "Supprimer",
      cancelText: "Annuler",
      variant: "danger",
    });
    if (!ok) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/tournament/${id}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/tournois");
      } else {
        const data = await res.json().catch(() => ({}));
        await alert({
          title: "Suppression impossible",
          description: data?.error || "Une erreur est survenue lors de la suppression.",
        });
      }
    } catch {
      await alert({
        title: "Erreur réseau",
        description: "Vérifie ta connexion puis réessaie.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className={`btn-neon flex items-center gap-2 rounded-lg px-4 py-2 font-semibold text-white transition bg-linear-to-r from-red-600 to-red-700 ${textSize}`}
    >
      <Trash2 size={18} />
      {loading ? "Suppression..." : "Supprimer le tournoi"}
    </button>
  );
}
