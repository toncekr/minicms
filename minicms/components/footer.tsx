import Image from "next/image";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-[color:var(--border)] bg-transparent">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-6 py-8 text-sm text-[color:var(--muted-foreground)] md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <Image
            src="/logo/weedpal-logo.png"
            alt="Weedpal logo"
            width={28}
            height={28}
            className="size-7 rounded-lg object-cover"
          />
          <p>Weedpal</p>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/" className="hover:text-[color:var(--foreground)]">
            Feed
          </Link>
          <Link href="/dashboard/logs" className="hover:text-[color:var(--foreground)]">
            Dashboard
          </Link>
        </div>
      </div>
    </footer>
  );
}
