"use client";

import { useEffect, useState } from "react";
import { SessionProvider } from "next-auth/react";
import { DialogProvider } from "@/components/DialogProvider";
import CookieConsent from "@/components/CookieConsent";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";

type ConsentState = "accepted" | "refused" | null;

export default function Providers({ children }: { children: React.ReactNode }) {
  const [consent, setConsent] = useState<ConsentState>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const stored = localStorage.getItem("glhf_cookie_consent");
      if (stored === "accepted" || stored === "refused") {
        setConsent(stored);
      }
      setReady(true);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  return (
    <SessionProvider>
      <DialogProvider>
        {children}
        <CookieConsent consent={consent} ready={ready} onChange={setConsent} />
        {consent === "accepted" && (
          <>
            <Analytics />
            <SpeedInsights />
          </>
        )}
      </DialogProvider>
    </SessionProvider>
  );
}
