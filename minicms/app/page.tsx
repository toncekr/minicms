import Image from "next/image";
import Link from "next/link";

import { auth } from "@/auth";
import { WeedLogFeed } from "@/components/weed-log-feed";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getRecentWeedLogs } from "@/lib/weed-logs";

export const revalidate = 300;

export default async function Home() {
  const session = await auth();
  const weedLogs = await getRecentWeedLogs();
  const averageRating =
    weedLogs.length > 0
      ? (
          weedLogs.reduce((total, weedLog) => total + weedLog.rating, 0) / weedLogs.length
        ).toFixed(1)
      : "0.0";
  const topTags = Array.from(
    weedLogs
      .flatMap((weedLog) => weedLog.tags)
      .reduce((accumulator, tag) => {
        const current = accumulator.get(tag.slug);

        accumulator.set(tag.slug, {
          ...tag,
          count: (current?.count ?? 0) + 1,
        });

        return accumulator;
      }, new Map<string, { id: string; name: string; slug: string; count: number }>()),
  )
    .map(([, tag]) => tag)
    .sort((left, right) => right.count - left.count)
    .slice(0, 5);
  const photoCount = weedLogs.filter((weedLog) => Boolean(weedLog.imageUrl)).length;

  return (
    <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[260px_minmax(0,1fr)_280px] lg:items-start">
      <aside className="space-y-4 lg:sticky lg:top-24">
        <Card className="overflow-hidden border-[color:var(--border-strong)]">
          <CardHeader className="space-y-5">
            <div className="flex items-center gap-4">
              <span className="overflow-hidden rounded-[1.5rem] border border-[color:var(--border)] bg-[color:var(--surface-elevated)] p-1">
                <Image
                  src="/logo/weedpal-logo.png"
                  alt="Weedpal logo"
                  width={64}
                  height={64}
                  className="size-14 rounded-[1.15rem] object-cover"
                />
              </span>
              <div>
                <p className="text-sm uppercase tracking-[0.18em] text-[color:var(--accent-bright)]">
                  Weedpal
                </p>
                <h1 className="mt-1 text-2xl font-semibold tracking-tight">Latest posts</h1>
              </div>
            </div>
            <p className="text-sm leading-6 text-[color:var(--muted-foreground)]">
              See what everyone is smoking right now, from quick ratings to full strain writeups.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild className="w-full">
              <Link href={session?.user ? "/dashboard/logs/new" : "/register"}>
                {session?.user ? "Post a log" : "Join Weedpal"}
              </Link>
            </Button>
            <Button asChild variant="ghost" className="w-full">
              <Link href={session?.user ? "/dashboard/logs" : "/login"}>
                {session?.user ? "Open my logs" : "Sign in"}
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Feed stats</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            <div className="rounded-[1.5rem] bg-[color:var(--surface-elevated)] p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]">
                Logs
              </p>
              <p className="mt-2 text-3xl font-semibold">{weedLogs.length}</p>
            </div>
            <div className="rounded-[1.5rem] bg-[color:var(--surface-elevated)] p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]">
                Avg rating
              </p>
              <p className="mt-2 text-3xl font-semibold">{averageRating}</p>
            </div>
            <div className="rounded-[1.5rem] bg-[color:var(--surface-elevated)] p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]">
                Photos
              </p>
              <p className="mt-2 text-3xl font-semibold">{photoCount}</p>
            </div>
          </CardContent>
        </Card>
      </aside>

      <section className="min-w-0 space-y-4">
        <WeedLogFeed weedLogs={weedLogs} />
      </section>

      <aside className="space-y-4 lg:sticky lg:top-24">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Trending tags</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topTags.length > 0 ? (
              topTags.map((tag) => (
                <Link
                  key={tag.id}
                  href={`/?tag=${tag.slug}`}
                  className="flex items-center justify-between rounded-[1.25rem] bg-[color:var(--surface-elevated)] px-4 py-3 transition hover:bg-[color:var(--surface-subtle)]"
                >
                  <span className="font-medium text-[color:var(--foreground)]">#{tag.name}</span>
                  <Badge className="bg-[color:var(--surface)] text-[color:var(--muted-foreground)]">
                    {tag.count}
                  </Badge>
                </Link>
              ))
            ) : (
              <p className="text-sm text-[color:var(--muted-foreground)]">No tags yet.</p>
            )}
          </CardContent>
        </Card>

       
      </aside>
    </div>
  );
}
