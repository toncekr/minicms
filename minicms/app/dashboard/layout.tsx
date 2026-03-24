import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { DashboardNav } from "@/components/dashboard-nav";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/api/auth/signin?callbackUrl=/dashboard");
  }

  return (
    <div className="mx-auto grid w-full max-w-7xl gap-8 px-6 py-12 lg:grid-cols-[260px_1fr]">
      <aside className="h-fit rounded-[2rem] border border-[color:var(--border)] bg-[color:var(--surface)] p-6 shadow-[0_18px_48px_-28px_rgba(27,40,53,0.28)]">
        <div className="mb-6">
          <p className="text-sm text-[color:var(--muted-foreground)]">Signed in as</p>
          <p className="mt-2 font-medium text-[color:var(--foreground)]">
            {session.user.name ?? session.user.email}
          </p>
        </div>
        <DashboardNav />
      </aside>
      <div>{children}</div>
    </div>
  );
}
