import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { auth } from "@/auth";
import { DeleteWeedLogButton } from "@/components/delete-weed-log-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { canManageWeedLog } from "@/lib/permissions";
import { siteConfig } from "@/lib/site";
import { absoluteUrl, formatDate } from "@/lib/utils";
import { getWeedLogBySlug } from "@/lib/weed-logs";

type WeedLogPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: WeedLogPageProps): Promise<Metadata> {
  const { slug } = await params;
  const weedLog = await getWeedLogBySlug(slug);

  if (!weedLog) {
    return {};
  }

  const summary = `${weedLog.strain} / ${weedLog.type} / ${weedLog.rating}/10`;

  return {
    title: `${weedLog.title} by ${weedLog.author.name ?? "Anonymous"}`,
    description: summary,
    alternates: {
      canonical: `/logs/${weedLog.slug}`,
    },
    openGraph: {
      title: weedLog.title,
      description: summary,
      type: "article",
      url: `${siteConfig.url}/logs/${weedLog.slug}`,
      images: weedLog.imageUrl ? [absoluteUrl(weedLog.imageUrl)] : undefined,
    },
  };
}

export default async function WeedLogPage({ params }: WeedLogPageProps) {
  const { slug } = await params;
  const [weedLog, session] = await Promise.all([getWeedLogBySlug(slug), auth()]);

  if (!weedLog) {
    notFound();
  }

  const canManage = canManageWeedLog(session?.user, weedLog.author.id);

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-16">
      <article className="overflow-hidden rounded-[2.5rem] border border-[color:var(--border-strong)] bg-[color:var(--surface)] shadow-[0_32px_80px_-48px_rgba(0,0,0,0.8)]">
        <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="relative min-h-[320px] bg-[color:var(--surface-subtle)]">
            {weedLog.imageUrl ? (
              <Image
                src={weedLog.imageUrl}
                alt={weedLog.title}
                width={1600}
                height={1200}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full min-h-[320px] items-end bg-[radial-gradient(circle_at_top,_rgba(120,201,92,0.34),_transparent_42%),linear-gradient(180deg,_rgba(38,54,35,0.98),_rgba(18,24,17,0.98))] p-8">
                <Badge className="bg-black/25 text-[color:var(--foreground)]">No photo</Badge>
              </div>
            )}
          </div>

          <div className="space-y-8 p-8 sm:p-10">
            <div className="space-y-5">
              <Link
                href="/"
                className="inline-flex text-sm font-medium text-[color:var(--muted-foreground)] hover:text-[color:var(--foreground)]"
              >
                Back to feed
              </Link>

              <div className="flex flex-wrap gap-2">
                <Badge>{weedLog.type}</Badge>
                <Badge className="bg-[color:var(--accent)]/18 text-[color:var(--accent-bright)]">
                  {weedLog.rating}/10
                </Badge>
                {weedLog.tags.map((tag) => (
                  <Badge
                    key={tag.id}
                    className="bg-[color:var(--surface-elevated)] text-[color:var(--muted-foreground)]"
                  >
                    #{tag.name}
                  </Badge>
                ))}
              </div>

              <div>
                <p className="text-sm uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]">
                  {weedLog.strain}
                </p>
                <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
                  {weedLog.title}
                </h1>
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-[color:var(--muted-foreground)]">
                <span>Posted by {weedLog.author.name ?? "Anonymous"}</span>
                <span>{formatDate(weedLog.createdAt)}</span>
              </div>
            </div>

            {canManage ? (
              <div className="flex flex-wrap gap-3">
                <Button asChild variant="secondary" size="sm">
                  <Link href={`/dashboard/logs/${weedLog.id}/edit`}>Edit log</Link>
                </Button>
                <DeleteWeedLogButton weedLogId={weedLog.id} redirectTo="/dashboard/logs" />
              </div>
            ) : null}
          </div>
        </div>

        <div className="border-t border-[color:var(--border)] px-8 py-10 sm:px-10">
          <div className="whitespace-pre-wrap text-base leading-8 text-[color:var(--foreground)]">
            {weedLog.content}
          </div>
        </div>
      </article>
    </div>
  );
}
