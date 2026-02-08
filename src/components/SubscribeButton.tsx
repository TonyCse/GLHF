"use client";

import { useSession } from "next-auth/react";
import React from "react";

interface Props {
  planId: number | string;
  price?: string;
}

export default function SubscribeButton({ planId, price }: Props) {
  const { status } = useSession();

  const handleSubscribe = async (e: React.MouseEvent) => {
    e.preventDefault();

    if (status !== "authenticated") {
      // redirect to signin page preserving the return URL
      const returnTo = encodeURIComponent(window.location.pathname + window.location.search);
      window.location.href = `/signin?returnTo=${returnTo}`;
      return;
    }

    try {
      const res = await fetch("/api/payment/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error || "Erreur lors de la souscription");
      }

      const redirectUrl = data.approvalUrl || data.redirectUrl;
      if (!redirectUrl) {
        throw new Error("Redirection manquante");
      }

      window.location.href = redirectUrl;
    } catch (error) {
      console.error("Erreur souscription:", error);
      alert("Une erreur est survenue. Veuillez réessayer.");
    }
  };

  return (
    <button
      onClick={handleSubscribe}
      className="w-full inline-flex items-center justify-center px-6 py-3 font-bold text-white rounded-xl bg-gradient-to-r from-[#8F60D0] to-[#A855F7] shadow-lg hover:opacity-95 transition"
    >
      S'abonner
    </button>
  );
}
