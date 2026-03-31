"use client";

import Link from "next/link";
import { useActionState } from "react";

import {
  loginAction,
  oauthSignInAction,
  type AuthActionState,
} from "@/app/auth-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type OauthProvider = {
  id: "google" | "github";
  label: string;
};

type LoginFormProps = {
  callbackUrl: string;
  oauthProviders: OauthProvider[];
};

const initialAuthActionState: AuthActionState = {};

function fieldError(
  fieldErrors: Record<string, string[] | undefined> | undefined,
  field: string,
) {
  return fieldErrors?.[field]?.[0];
}

export function LoginForm({ callbackUrl, oauthProviders }: LoginFormProps) {
  const [state, formAction, pending] = useActionState(loginAction, initialAuthActionState);

  return (
    <div className="space-y-6">
      {oauthProviders.length > 0 ? (
        <div className="space-y-3">
          {oauthProviders.map((provider) => (
            <form key={provider.id} action={oauthSignInAction}>
              <input type="hidden" name="callbackUrl" value={callbackUrl} />
              <input type="hidden" name="provider" value={provider.id} />
              <Button type="submit" variant="secondary" className="w-full">
                Continue with {provider.label}
              </Button>
            </form>
          ))}
        </div>
      ) : null}

      {oauthProviders.length > 0 ? (
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-[color:var(--border)]" />
          </div>
          <div className="relative flex justify-center text-xs uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]">
            <span className="bg-[color:var(--surface)] px-3">or use email</span>
          </div>
        </div>
      ) : null}

      <form action={formAction} className="space-y-5">
        <input type="hidden" name="callbackUrl" value={callbackUrl} />

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            defaultValue={state.values?.email ?? ""}
            placeholder="you@example.com"
          />
          {fieldError(state.fieldErrors, "email") ? (
            <p className="text-sm text-[#b42318]">{fieldError(state.fieldErrors, "email")}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="Enter your password"
          />
          {fieldError(state.fieldErrors, "password") ? (
            <p className="text-sm text-[#b42318]">
              {fieldError(state.fieldErrors, "password")}
            </p>
          ) : null}
        </div>

        {state.error ? (
          <p className="rounded-2xl bg-[#fef3f2] px-4 py-3 text-sm text-[#b42318]">
            {state.error}
          </p>
        ) : null}

        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Signing in..." : "Sign In"}
        </Button>
      </form>

      <p className="text-sm text-[color:var(--muted-foreground)]">
        Need an account first?{" "}
        <Link
          href={`/register?callbackUrl=${encodeURIComponent(callbackUrl)}`}
          className="font-medium text-[color:var(--accent)] hover:text-[color:var(--accent-strong)]"
        >
          Create one here
        </Link>
        .
      </p>
    </div>
  );
}
