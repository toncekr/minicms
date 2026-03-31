import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { DeleteWeedLogButton } from "@/components/delete-weed-log-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { canManageWeedLog } from "@/lib/permissions";
import { getUserWeedLogs } from "@/lib/weed-logs";
import { formatDate } from "@/lib/utils";

export default async function DashboardLogsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/dashboard/logs");
  }

  const weedLogs = await getUserWeedLogs(session.user.id, session.user.role);
  const isAdmin = session.user.role === "ADMIN";

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            {isAdmin ? "All logs" : "My logs"}
          </h1>
          <p className="mt-2 text-[color:var(--muted-foreground)]">
            {isAdmin ? "Manage the full forum feed." : "Your recent posts and edits."}
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/logs/new">New log</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{isAdmin ? "Forum feed" : "Your feed"}</CardTitle>
          <CardDescription>
            {isAdmin ? "Every post in the forum." : "Logs you created."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {weedLogs.length > 0 ? (
            <div className="space-y-4">
              {weedLogs.map((weedLog) => (
                <div
                  key={weedLog.id}
                  className="grid gap-4 rounded-[1.75rem] border border-[color:var(--border)] bg-[color:var(--surface-elevated)] p-5 md:grid-cols-[96px_1fr_auto]"
                >
                  <div className="overflow-hidden rounded-[1.25rem] bg-[color:var(--surface-subtle)]">
                    {weedLog.imageUrl ? (
                      <Image
                        src={weedLog.imageUrl}
                        alt={weedLog.title}
                        width={192}
                        height={192}
                        className="h-24 w-24 object-cover"
                      />
                    ) : (
                      <div className="flex h-24 w-24 items-center justify-center text-xs uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]">
                        No photo
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      <Badge>{weedLog.type}</Badge>
                      <Badge className="bg-[color:var(--accent)]/18 text-[color:var(--accent-bright)]">
                        {weedLog.rating}/10
                      </Badge>
                      {weedLog.tags.map((tag) => (
                        <Badge
                          key={tag.id}
                          className="bg-[color:var(--surface)] text-[color:var(--muted-foreground)]"
                        >
                          #{tag.name}
                        </Badge>
                      ))}
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold">{weedLog.title}</h2>
                      <p className="mt-1 text-sm text-[color:var(--muted-foreground)]">
                        {weedLog.strain}
                      </p>
                    </div>
                    <p className="text-sm text-[color:var(--muted-foreground)]">
                      {isAdmin ? `${weedLog.author.name ?? "Anonymous"} / ` : ""}
                      Updated {formatDate(weedLog.updatedAt)}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-start gap-3 md:justify-end">
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/logs/${weedLog.slug}`}>View</Link>
                    </Button>
                    {canManageWeedLog(session.user, weedLog.author.id) ? (
                      <>
                        <Button asChild variant="secondary" size="sm">
                          <Link href={`/dashboard/logs/${weedLog.id}/edit`}>Edit</Link>
                        </Button>
                        <DeleteWeedLogButton weedLogId={weedLog.id} />
                      </>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-[1.75rem] border border-dashed border-[color:var(--border)] p-8 text-center">
              <p className="text-lg font-medium">No logs yet</p>
              <p className="mt-2 text-sm text-[color:var(--muted-foreground)]">
                Post your first log to start the feed.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
