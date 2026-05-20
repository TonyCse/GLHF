"use client";

import { ReactNode, useState } from "react";

interface ButtonProps {
  children?: ReactNode;
  onClick?: () => void | Promise<void>;
  className?: string;
  disabled?: boolean;
  textSize?: string;
  variant?: "default" | "subtle" | "success";
}

// Bouton
export default function Button({
  children = "Valider",
  onClick,
  className = "",
  disabled = false,
  textSize = "text-2xl",
  variant = "default",
}: ButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (!onClick || loading || disabled) return;
    setLoading(true);
    try {
      await onClick();
    } finally {
      setLoading(false);
    }
  };

  // Si une classe personnalisée est passée, on n'applique que celle-ci (pas de padding/arrondi par défaut)
  const hasCustomClass = className && className.trim().length > 0;
  return (
    <button
      onClick={handleClick}
      disabled={disabled || loading}
      className={
        hasCustomClass
          ? `${className} ${textSize}`
          : `relative inline-flex items-center justify-center px-10 py-5 overflow-hidden font-bold text-white rounded-xl ${
              variant === "default"
                ? "bg-linear-to-r from-[#8F60D0] to-[#A855F7] shadow-lg"
                : variant === "success"
                  ? "bg-linear-to-r from-[#1f6e4f] via-[#238b61] to-[#1f6e4f] border border-[#34d399]/50 text-white shadow-[0_10px_28px_rgba(12,28,20,0.35)] ring-1 ring-white/10 hover:from-[#238b61] hover:via-[#2aa66f] hover:to-[#238b61] hover:border-[#34d399]/80 hover:shadow-[0_14px_34px_rgba(52,211,153,0.35)]"
                  : "bg-linear-to-r from-[#5b3a8f] via-[#6a40a6] to-[#5b3a8f] border border-[#8F60D0]/60 text-white shadow-[0_10px_28px_rgba(20,12,34,0.35)] ring-1 ring-white/10 hover:from-[#6a40a6] hover:via-[#7a49bf] hover:to-[#6a40a6] hover:border-[#A855F7]/80 hover:shadow-[0_14px_34px_rgba(143,96,208,0.35)]"
            } transition-all duration-300 group cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 ${textSize}`
      }
    >
      <div className="relative z-10 flex items-center gap-2">
        {loading ? "Chargement..." : children}
      </div>
    </button>
  );
}
