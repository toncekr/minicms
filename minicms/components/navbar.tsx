import Image from "next/image";
import Link from "next/link";

import { auth, signOut } from "@/auth";

import { Button } from "@/components/ui/button";

export async function Navbar() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-40 border-b border-[color:var(--border)] bg-[color:var(--surface)]/92 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-3 text-[color:var(--foreground)]">
            <span className="overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-elevated)] p-1 shadow-[0_10px_24px_-20px_rgba(44,71,43,0.24)]">
              <Image
                src="/logo/weedpal-logo.png"
                alt="Weedpal logo"
                width={40}
                height={40}
                className="size-10 rounded-xl object-cover"
              />
            </span>
            <span className="flex flex-col leading-none">
              <span className="text-lg font-semibold tracking-tight">Weedpal</span>
              <span className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]">
                Latest posts
              </span>
            </span>
          </Link>
          <nav className="hidden items-center gap-5 text-sm text-[color:var(--muted-foreground)] md:flex">
            <Link href="/" className="hover:text-[color:var(--foreground)]">
              Feed
            </Link>
            {session?.user ? (
              <Link href="/dashboard/logs" className="hover:text-[color:var(--foreground)]">
                Dashboard
              </Link>
            ) : null}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {session?.user ? (
            <>
              <span className="hidden rounded-full bg-[color:var(--surface-elevated)] px-3 py-2 text-sm text-[color:var(--muted-foreground)] lg:inline">
                {session.user.name ?? session.user.email}
              </span>
              <Button asChild variant="secondary" size="sm">
                <Link href="/dashboard/logs/new">Post</Link>
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
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/login">Sign in</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/register">Join Weedpal</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
