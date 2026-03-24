import * as React from "react";

import { cn } from "@/lib/utils";

export function Badge({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full bg-[color:var(--surface-subtle)] px-3 py-1 text-xs font-medium text-[color:var(--foreground)]",
        className,
      )}
      {...props}
    />
  );
}
