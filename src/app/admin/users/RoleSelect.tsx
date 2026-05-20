"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  userId: number;
  currentRole: "USER" | "ADMIN" | "SUPER_ADMIN";
  disabled?: boolean;
}

const ROLE_STYLES: Record<string, string> = {
  USER: "border-gray-600/40 text-white bg-[#232426]",
  ADMIN: "border-purple-600/40 text-purple-300 bg-[#2b2140]",
  SUPER_ADMIN: "border-amber-600/40 text-amber-300 bg-amber-600/10",
};

export default function RoleSelect({ userId, currentRole, disabled }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newRole = e.target.value;
    if (newRole === currentRole) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}/set-role`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        alert(data?.message ?? "Erreur lors du changement de rôle");
      }
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <select
      value={currentRole}
      onChange={handleChange}
      disabled={disabled || loading}
      className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#A855F7] ${
        disabled ? "opacity-60 cursor-not-allowed" : ""
      } ${ROLE_STYLES[currentRole] ?? ROLE_STYLES.USER}`}
    >
      <option value="USER">Utilisateur</option>
      <option value="ADMIN">Admin</option>
      <option value="SUPER_ADMIN">Super Admin</option>
    </select>
  );
}
