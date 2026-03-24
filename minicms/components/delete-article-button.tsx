"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

type DeleteArticleButtonProps = {
  articleId: string;
};

export function DeleteArticleButton({ articleId }: DeleteArticleButtonProps) {
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
          if (!window.confirm("Delete this article? This action cannot be undone.")) {
            return;
          }

          setError("");

          startTransition(async () => {
            const response = await fetch(`/api/articles/${articleId}`, {
              method: "DELETE",
            });

            if (!response.ok) {
              const payload = (await response.json().catch(() => null)) as
                | { error?: string }
                | null;

              setError(payload?.error ?? "Unable to delete this article.");
              return;
            }

            router.refresh();
          });
        }}
      >
        {isPending ? "Deleting..." : "Delete"}
      </Button>
      {error ? <p className="text-sm text-[#b42318]">{error}</p> : null}
    </div>
  );
}
