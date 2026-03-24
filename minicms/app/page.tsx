import { ArticleBrowser } from "@/components/article-browser";
import { getPublishedArticles } from "@/lib/articles";

export const revalidate = 3600;

export default async function Home() {
  const articles = await getPublishedArticles();

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-12 px-6 py-16">
      <section className="grid gap-8 rounded-[2.5rem] border border-[color:var(--border)] bg-[color:var(--surface)] p-8 shadow-[0_18px_48px_-28px_rgba(27,40,53,0.28)] lg:grid-cols-[1.5fr_1fr] lg:p-12">
        <div className="space-y-5">
          <span className="inline-flex rounded-full bg-[color:var(--surface-subtle)] px-4 py-2 text-sm font-medium text-[color:var(--foreground)]">
            Publishing made deliberate
          </span>
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-[color:var(--foreground)] sm:text-5xl">
            A focused editorial space for writing, organizing, and publishing articles.
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-[color:var(--muted-foreground)]">
            Browse published articles, filter by topic, and manage drafts from a protected
            dashboard built for a small team or a single editor.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          <div className="rounded-[2rem] bg-[color:var(--surface-subtle)] p-6">
            <p className="text-sm uppercase tracking-[0.2em] text-[color:var(--muted-foreground)]">
              Published
            </p>
            <p className="mt-3 text-4xl font-semibold">{articles.length}</p>
          </div>
          <div className="rounded-[2rem] bg-[color:var(--surface-subtle)] p-6">
            <p className="text-sm uppercase tracking-[0.2em] text-[color:var(--muted-foreground)]">
              Topics
            </p>
            <p className="mt-3 text-4xl font-semibold">
              {
                new Set(articles.flatMap((article) => article.tags.map((tag) => tag.slug))).size
              }
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-3xl font-semibold tracking-tight">Latest articles</h2>
          <p className="text-[color:var(--muted-foreground)]">
            Search the current catalog or narrow it down by tag.
          </p>
        </div>
        <ArticleBrowser articles={articles} />
      </section>
    </div>
  );
}
