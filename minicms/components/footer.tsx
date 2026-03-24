import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-[color:var(--border)] bg-white/70">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-6 py-8 text-sm text-[color:var(--muted-foreground)] md:flex-row md:items-center md:justify-between">
        <p>MiniCMS is a compact editorial workspace built with Next.js, Prisma, and Auth.js.</p>
        <div className="flex items-center gap-4">
          <Link href="/" className="hover:text-[color:var(--foreground)]">
            Home
          </Link>
          <Link href="/dashboard" className="hover:text-[color:var(--foreground)]">
            Dashboard
          </Link>
        </div>
      </div>
    </footer>
  );
}
