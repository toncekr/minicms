import * as React from "react";
import { Slot } from "@radix-ui/react-slot";

import { cn } from "@/lib/utils";

type ButtonVariant = "default" | "secondary" | "outline" | "ghost" | "destructive";
type ButtonSize = "default" | "sm" | "lg" | "icon";

const variantClasses: Record<ButtonVariant, string> = {
  default: "bg-[color:var(--accent)] text-white hover:bg-[color:var(--accent-strong)]",
  secondary:
    "bg-[color:var(--surface-subtle)] text-[color:var(--foreground)] hover:bg-[color:var(--border)]",
  outline:
    "border border-[color:var(--border)] bg-transparent text-[color:var(--foreground)] hover:bg-[color:var(--surface-subtle)]",
  ghost: "bg-transparent text-[color:var(--foreground)] hover:bg-[color:var(--surface-subtle)]",
  destructive: "bg-[#b42318] text-white hover:bg-[#912018]",
};

const sizeClasses: Record<ButtonSize, string> = {
  default: "h-10 px-4 py-2",
  sm: "h-9 px-3 text-sm",
  lg: "h-11 px-5",
  icon: "size-10",
};

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
  size?: ButtonSize;
  variant?: ButtonVariant;
};

export function Button({
  asChild = false,
  className,
  size = "default",
  variant = "default",
  ...props
}: ButtonProps) {
  const Component = asChild ? Slot : "button";

  return (
    <Component
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ring)] disabled:pointer-events-none disabled:opacity-50",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    />
  );
}
