"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

type DeleteWeedLogButtonProps = {
  weedLogId: string;
  redirectTo?: string;
};

export function DeleteWeedLogButton({
  weedLogId,
  redirectTo,
}: DeleteWeedLogButtonProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="destructive"
        size="sm"
        disabled={isPending}
        onClick={() => {
          if (!window.confirm("Delete this log? This cannot be undone.")) {
            return;
          }

          setError("");

          startTransition(async () => {
            try {
              const response = await fetch(`/api/logs/${weedLogId}`, {
                method: "DELETE",
              });

              if (!response.ok) {
                const payload = (await response.json().catch(() => null)) as
                  | { error?: string }
                  | null;

                setError(payload?.error ?? "Unable to delete this log.");
                return;
              }

              if (redirectTo) {
                router.push(redirectTo);
              }

              router.refresh();
            } catch {
              setError("Unable to delete this log right now.");
            }
          });
        }}
      >
        {isPending ? "Deleting..." : "Delete"}
      </Button>
      {error ? <p className="text-sm text-[#ff8b8b]">{error}</p> : null}
    </div>
  );
}
