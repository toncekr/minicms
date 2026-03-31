import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { AuthShell } from "@/components/auth-shell";
import { LoginForm } from "@/components/login-form";
import { getSafeRedirect } from "@/lib/auth-redirect";

type LoginPageProps = {
  searchParams: Promise<{
    callbackUrl?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await auth();
  const params = await searchParams;
  const callbackUrl = getSafeRedirect(params.callbackUrl);
  const oauthProviders = [
    ...(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET
      ? [{ id: "google" as const, label: "Google" }]
      : []),
    ...(process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET
      ? [{ id: "github" as const, label: "GitHub" }]
      : []),
  ];

  if (session?.user?.id) {
    redirect(callbackUrl);
  }

  return (
    <AuthShell
      eyebrow="Weedpal"
      title="Sign in"
      description="Use email or a connected account."
      asideTitle="Sign in"
      asideDescription="Access your dashboard and weed logs."
    >
      <LoginForm callbackUrl={callbackUrl} oauthProviders={oauthProviders} />
    </AuthShell>
  );
}
