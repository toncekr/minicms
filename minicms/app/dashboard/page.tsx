import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardOverview } from "@/lib/articles";
import { formatDate } from "@/lib/utils";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/api/auth/signin?callbackUrl=/dashboard");
  }

  const overview = await getDashboardOverview(session.user.id);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Dashboard overview</h1>
          <p className="mt-2 text-[color:var(--muted-foreground)]">
            Keep track of published work and unfinished drafts.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/articles/new">Create article</Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>Total articles</CardDescription>
            <CardTitle className="text-4xl">{overview.articleCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Published</CardDescription>
            <CardTitle className="text-4xl">{overview.publishedCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Drafts</CardDescription>
            <CardTitle className="text-4xl">{overview.draftCount}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent drafts</CardTitle>
          <CardDescription>Your latest unpublished work.</CardDescription>
        </CardHeader>
        <CardContent>
          {overview.recentDrafts.length > 0 ? (
            <div className="space-y-4">
              {overview.recentDrafts.map((draft) => (
                <div
                  key={draft.id}
                  className="flex flex-col gap-3 rounded-[1.5rem] border border-[color:var(--border)] p-4 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <p className="font-medium">{draft.title}</p>
                    <p className="text-sm text-[color:var(--muted-foreground)]">
                      Updated {formatDate(draft.updatedAt)}
                    </p>
                  </div>
                  <Button asChild variant="secondary" size="sm">
                    <Link href={`/dashboard/articles/${draft.id}/edit`}>Continue editing</Link>
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[color:var(--muted-foreground)]">
              No drafts yet. Published articles and drafts will both show up here as you start
              writing.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
