import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { AuthShell } from "@/components/auth-shell";
import { RegisterForm } from "@/components/register-form";
import { getSafeRedirect } from "@/lib/auth-redirect";

type RegisterPageProps = {
  searchParams: Promise<{
    callbackUrl?: string;
  }>;
};

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
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
      title="Create account"
      description="Use email or a connected account."
      asideTitle="Create account"
      asideDescription="Set up an account to post and manage weed logs."
    >
      <RegisterForm callbackUrl={callbackUrl} oauthProviders={oauthProviders} />
    </AuthShell>
  );
}
