"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React from "react";

interface Props {
  planId: number | string;
  price?: string;
}

export default function SubscribeButton({ planId, price }: Props) {
  const { data: session, status } = useSession();
  const router = useRouter();

  const handleSubscribe = (e: React.MouseEvent) => {
    e.preventDefault();

    if (status !== "authenticated") {
      // redirect to signin page preserving the return URL
      const returnTo = encodeURIComponent(window.location.pathname + window.location.search);
      window.location.href = `/signin?returnTo=${returnTo}`;
      return;
    }

    // Create a normal form so the browser follows redirects (PayPal approval link)
    const form = document.createElement("form");
    form.method = "POST";
    form.action = "/api/paypal/create-subscription";

    const inputPlan = document.createElement("input");
    inputPlan.type = "hidden";
    inputPlan.name = "planId";
    inputPlan.value = String(planId);
    form.appendChild(inputPlan);

    if (price !== undefined) {
      const inputPrice = document.createElement("input");
      inputPrice.type = "hidden";
      inputPrice.name = "price";
      inputPrice.value = String(price);
      form.appendChild(inputPrice);
    }

    document.body.appendChild(form);
    form.submit();
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
