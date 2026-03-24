import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { DeleteArticleButton } from "@/components/delete-article-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getUserArticles } from "@/lib/articles";
import { formatDate } from "@/lib/utils";

export default async function DashboardArticlesPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/api/auth/signin?callbackUrl=/dashboard/articles");
  }

  const articles = await getUserArticles(session.user.id);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">My articles</h1>
          <p className="mt-2 text-[color:var(--muted-foreground)]">
            Review everything you have written, whether it is live or still in progress.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/articles/new">Create article</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All entries</CardTitle>
          <CardDescription>
            Edit existing articles, open drafts, or remove entries that are no longer needed.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {articles.length > 0 ? (
            <div className="space-y-4">
              {articles.map((article) => (
                <div
                  key={article.id}
                  className="grid gap-4 rounded-[1.75rem] border border-[color:var(--border)] p-5 md:grid-cols-[1fr_auto]"
                >
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      <Badge className={article.published ? "" : "bg-[#fef3c7] text-[#92400e]"}>
                        {article.published ? "Published" : "Draft"}
                      </Badge>
                      {article.categories.map((category) => (
                        <Badge key={category.id} className="bg-white text-[color:var(--muted-foreground)]">
                          {category.name}
                        </Badge>
                      ))}
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold">{article.title}</h2>
                      <p className="mt-1 text-sm text-[color:var(--muted-foreground)]">
                        {article.description}
                      </p>
                    </div>
                    <p className="text-sm text-[color:var(--muted-foreground)]">
                      Updated {formatDate(article.updatedAt)}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-start gap-3 md:justify-end">
                    {article.published ? (
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/${article.slug}`}>View</Link>
                      </Button>
                    ) : null}
                    <Button asChild variant="secondary" size="sm">
                      <Link href={`/dashboard/articles/${article.id}/edit`}>Edit</Link>
                    </Button>
                    <DeleteArticleButton articleId={article.id} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-[1.75rem] border border-dashed border-[color:var(--border)] p-8 text-center">
              <p className="text-lg font-medium">No articles yet</p>
              <p className="mt-2 text-sm text-[color:var(--muted-foreground)]">
                Create your first article to start building the public site.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
