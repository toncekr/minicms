"use client";

import { useState } from "react";
import Script from "next/script";

import { Button } from "@/components/ui/button";

const consentStorageKey = "weedpal-analytics-consent";

type AnalyticsConsentProps = {
  gaId?: string;
};

export function AnalyticsConsent({ gaId }: AnalyticsConsentProps) {
  const [consent, setConsent] = useState<"accepted" | "declined" | null>(() => {
    if (typeof window === "undefined") {
      return null;
    }

    const storedValue = window.localStorage.getItem(consentStorageKey);

    return storedValue === "accepted" || storedValue === "declined" ? storedValue : null;
  });

  if (!gaId) {
    return null;
  }

  const shouldLoadAnalytics = consent === "accepted";
  const shouldShowBanner = consent === null;

  return (
    <>
      {shouldLoadAnalytics ? (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${gaId}');
            `}
          </Script>
        </>
      ) : null}

      {shouldShowBanner ? (
        <div className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-3xl rounded-[1.75rem] border border-[color:var(--border-strong)] bg-[color:var(--surface)] p-5 shadow-[0_24px_64px_-40px_rgba(0,0,0,0.28)] sm:inset-x-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-[color:var(--foreground)]">
                Analytics consent
              </p>
              <p className="text-sm text-[color:var(--muted-foreground)]">
                Allow Google Analytics to help track usage and improve Weedpal.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  window.localStorage.setItem(consentStorageKey, "declined");
                  setConsent("declined");
                }}
              >
                Decline
              </Button>
              <Button
                type="button"
                onClick={() => {
                  window.localStorage.setItem(consentStorageKey, "accepted");
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
