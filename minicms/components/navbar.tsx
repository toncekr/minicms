import Link from "next/link";

import { auth, signOut } from "@/auth";

import { Button } from "@/components/ui/button";

export async function Navbar() {
  const session = await auth();

  return (
    <header className="border-b border-[color:var(--border)] bg-white/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-6 py-4">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-xl font-semibold tracking-tight text-[color:var(--foreground)]">
            MiniCMS
          </Link>
          <nav className="hidden items-center gap-5 text-sm text-[color:var(--muted-foreground)] md:flex">
            <Link href="/" className="hover:text-[color:var(--foreground)]">
              Articles
            </Link>
            <Link href="/dashboard" className="hover:text-[color:var(--foreground)]">
              Dashboard
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {session?.user ? (
            <>
              <span className="hidden text-sm text-[color:var(--muted-foreground)] sm:inline">
                {session.user.name ?? session.user.email}
              </span>
              <Button asChild variant="secondary" size="sm">
                <Link href="/dashboard">Open Dashboard</Link>
              </Button>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <Button variant="ghost" size="sm" type="submit">
                  Sign Out
                </Button>
              </form>
            </>
          ) : (
            <Button asChild size="sm">
              <Link href="/api/auth/signin">Sign In</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
