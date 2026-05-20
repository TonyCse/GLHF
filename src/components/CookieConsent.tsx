"use client";

import { useCallback, useEffect, useRef } from "react";
import Link from "next/link";

type ConsentState = "accepted" | "refused" | null;

type CookieConsentProps = {
  consent: ConsentState;
  ready: boolean;
  onChange: (value: ConsentState) => void;
};

export default function CookieConsent({ consent, ready, onChange }: CookieConsentProps) {
  const refuseRef = useRef<HTMLButtonElement>(null);

  const handleChoice = useCallback((value: "accepted" | "refused") => {
    localStorage.setItem("glhf_cookie_consent", value);
    document.cookie = `glhf_cookie_consent=${value}; Max-Age=31536000; Path=/; SameSite=Lax`;
    onChange(value);
  }, [onChange]);

  useEffect(() => {
    if (!ready || consent) return;
    refuseRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleChoice("refused");
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [ready, consent, handleChoice]);

  if (!ready || consent) return null;

  return (
    <div
      className="fixed bottom-4 right-4 z-50 w-[90vw] max-w-sm rounded-2xl border border-white/10 bg-linear-to-br from-[#1c1d1f] to-[#2a2b2f] p-5 shadow-2xl"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cookie-consent-title"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div id="cookie-consent-title" className="text-sm text-white">
          Nous utilisons des cookies pour mesurer l&apos;audience et améliorer votre expérience.
          <span className="ml-1">
            <Link
              href="/politique-confidentialite"
              className="text-[#8F60D0] hover:text-[#A855F7] underline"
            >
              En savoir plus
            </Link>
            .
          </span>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <button
            ref={refuseRef}
            type="button"
            onClick={() => handleChoice("refused")}
            className="btn-neon rounded-md border border-white/10 px-4 py-2 text-sm font-semibold text-white hover:border-[#8F60D0]/60 hover:text-white transition"
          >
            Refuser
          </button>
          <button
            type="button"
            onClick={() => handleChoice("accepted")}
            className="btn-neon rounded-md bg-linear-to-r from-[#8F60D0] to-[#A855F7] px-4 py-2 text-sm font-semibold text-white shadow-md transition"
          >
            Accepter
          </button>
        </div>
      </div>
    </div>
  );
}
