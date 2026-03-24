"use client";

import { useState } from "react";
import Script from "next/script";

import { Button } from "@/components/ui/button";

const storageKey = "minicms-cookie-consent";

export function CookieConsent() {
  const [consent, setConsent] = useState<"accepted" | "declined" | null>(() => {
    if (typeof window === "undefined") {
      return null;
    }

    const stored = window.localStorage.getItem(storageKey);
    return stored === "accepted" || stored === "declined" ? stored : null;
  });
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  return (
    <>
      {gaId && consent === "accepted" ? (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${gaId}');`}
          </Script>
        </>
      ) : null}

      {consent === null ? (
        <div className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-2xl rounded-[2rem] border border-[color:var(--border)] bg-white p-5 shadow-[0_18px_48px_-28px_rgba(27,40,53,0.28)]">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-medium text-[color:var(--foreground)]">Analytics consent</p>
              <p className="mt-1 text-sm text-[color:var(--muted-foreground)]">
                We only load Google Analytics after you explicitly accept it.
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  window.localStorage.setItem(storageKey, "declined");
                  setConsent("declined");
                }}
              >
                Decline
              </Button>
              <Button
                type="button"
                onClick={() => {
                  window.localStorage.setItem(storageKey, "accepted");
                  setConsent("accepted");
                }}
              >
                Accept
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
