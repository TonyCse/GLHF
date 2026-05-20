"use client";

import { useState } from "react";
import { RotateCcw } from "lucide-react";
import { useDialog } from "@/components/DialogProvider";

type AvatarRegenerateButtonProps = {
  email?: string | null;
  onAvatarUpdated?: (avatarUrl: string) => void;
};

export default function AvatarRegenerateButton({
  email,
  onAvatarUpdated,
}: AvatarRegenerateButtonProps) {
  const [loading, setLoading] = useState(false);
  const canUse = !!email && !loading;
  const { confirm } = useDialog();

  const handleClick = async () => {
    if (!email) return;
    const ok = await confirm({
      title: "Régénérer l'avatar ?",
      description: "Ton avatar actuel sera remplacé par un nouveau.",
      confirmText: "Régénérer",
      cancelText: "Annuler",
    });
    if (!ok) return;
    setLoading(true);
    try {
      const res = await fetch("/api/user/avatar", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data: { success?: boolean; avatarUrl?: string | null } = await res.json();
      if (data.success && data.avatarUrl) {
        const nextUrl = data.avatarUrl.replace("/svg?", "/png?");
        onAvatarUpdated?.(nextUrl);
        window.dispatchEvent(
          new CustomEvent("glhf:avatar-updated", { detail: { avatarUrl: nextUrl } }),
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={!canUse}
      className={`absolute -bottom-2 -right-2 bg-[#8F60D0] hover:bg-[#A855F7] text-white p-2 rounded-full shadow transition ${
        canUse ? "cursor-pointer" : "opacity-60 cursor-not-allowed"
      }`}
      aria-label="Régénérer l'avatar"
    >
      <RotateCcw size={18} />
    </button>
  );
}
