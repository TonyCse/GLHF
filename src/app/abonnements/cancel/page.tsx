"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CancelPass() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();

  const handleCancel = async () => {
    if (!confirm("Voulez-vous vraiment résilier votre abonnement ?")) return;
    setLoading(true);
    try {
      const res = await fetch("/api/user/cancel-plan", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data?.error || "Erreur lors de la résiliation");
      } else {
        setMessage("Abonnement résilié avec succès.");
        router.refresh();
      }
    } catch (e: any) {
      setMessage(e.message || "Erreur réseau");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-16 text-white">
      <div className="max-w-xl w-full bg-[#232426] p-8 rounded-xl border border-[#8F60D0]/20">
        <h1 className="text-2xl font-bold mb-4">Résilier mon abonnement</h1>
        <p className="text-gray-300 mb-6">En résiliant, votre forfait sera retiré et vous perdrez les bénéfices associés à la fin de la période en cours.</p>

        {message && <div className="mb-4 text-sm text-center text-gray-200">{message}</div>}

        <div className="flex gap-4">
          <button onClick={() => router.back()} className="flex-1 rounded-xl px-4 py-3 border border-white/10">Annuler</button>
          <button onClick={handleCancel} disabled={loading} className="flex-1 rounded-xl bg-gradient-to-r from-[#8F60D0] to-[#A855F7] px-4 py-3 font-semibold">
            {loading ? "Résiliation..." : "Résilier"}
          </button>
        </div>
      </div>
    </main>
  );
}
