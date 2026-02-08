"use client";

import { useState } from "react";
import { RotateCcw } from "lucide-react";

export default function AvatarRegenerateButton({ email }: { email?: string | null }) {
  const [loading, setLoading] = useState(false);
  const canUse = !!email && !loading;

  const handleClick = async () => {
    if (!email) return;
    setLoading(true);
    try {
      const res = await fetch("/api/user/avatar", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data: { success?: boolean } = await res.json();
      if (data.success) window.location.reload();
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
      aria-label="Regenerer l'avatar"
    >
      <RotateCcw size={18} />
    </button>
  );
}
