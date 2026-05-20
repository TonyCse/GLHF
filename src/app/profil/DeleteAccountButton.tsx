"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { Trash2 } from "lucide-react";
import { useDialog } from "@/components/DialogProvider";

export default function DeleteAccountButton() {
  const [loading, setLoading] = useState(false);
  const { confirm, alert } = useDialog();

  const handleDelete = async () => {
    const ok = await confirm({
      title: "Supprimer ton compte ?",
      description:
        "Ton compte sera désactivé et ton profil ne sera plus visible. Cette action te déconnectera immédiatement.",
      confirmText: "Supprimer mon compte",
      cancelText: "Annuler",
      variant: "danger",
    });
    if (!ok) return;

    setLoading(true);
    try {
      const res = await fetch("/api/user", { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Impossible de supprimer le compte.");
      }

      await signOut({ callbackUrl: "/" });
    } catch (error) {
      setLoading(false);
      await alert({
        title: "Suppression impossible",
        description:
          error instanceof Error ? error.message : "Une erreur est survenue. Réessaie plus tard.",
        variant: "danger",
      });
    }
  };

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={loading}
      className="btn-neon inline-flex items-center justify-center gap-2 rounded-lg bg-linear-to-r from-red-600 to-red-700 px-4 py-2 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60"
    >
      <Trash2 size={16} />
      {loading ? "Suppression..." : "Supprimer mon compte"}
    </button>
  );
}
