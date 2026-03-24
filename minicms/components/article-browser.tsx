"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import type { ArticleSummary } from "@/lib/articles";

import { ArticleCard } from "@/components/article-card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type ArticleBrowserProps = {
  articles: ArticleSummary[];
};

function matchesArticle(article: ArticleSummary, query: string, tag: string) {
  const normalizedQuery = query.trim().toLowerCase();
  const matchesQuery =
    !normalizedQuery ||
    article.title.toLowerCase().includes(normalizedQuery) ||
    article.description.toLowerCase().includes(normalizedQuery) ||
    article.content.toLowerCase().includes(normalizedQuery);

  const matchesTag =
    tag === "all" || article.tags.some((articleTag) => articleTag.slug === tag);

  return matchesQuery && matchesTag;
}

export function ArticleBrowser({ articles }: ArticleBrowserProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const query = searchParams.get("query") ?? "";
  const selectedTag = searchParams.get("tag") ?? "all";
  const tags = Array.from(
    new Map(
      articles.flatMap((article) => article.tags.map((tag) => [tag.slug, tag] as const)),
    ).values(),
  );

  function updateSearchParams(nextQuery: string, nextTag: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (nextQuery.trim()) {
      params.set("query", nextQuery.trim());
    } else {
      params.delete("query");
    }

    if (nextTag !== "all") {
      params.set("tag", nextTag);
    } else {
      params.delete("tag");
    }

    const nextUrl = params.toString() ? `${pathname}?${params}` : pathname;
    router.replace(nextUrl, { scroll: false });
  }

  const visibleArticles = articles.filter((article) =>
    matchesArticle(article, query, selectedTag),
  );

  return (
    <div className="space-y-8">
      <div className="grid gap-4 rounded-[2rem] border border-[color:var(--border)] bg-[color:var(--surface)] p-6 shadow-[0_18px_48px_-28px_rgba(27,40,53,0.28)] md:grid-cols-[1fr_240px]">
        <Input
          value={query}
          onChange={(event) => {
            updateSearchParams(event.target.value, selectedTag);
          }}
          placeholder="Search by title, summary, or content"
          aria-label="Search articles"
        />
        <Select
          value={selectedTag}
          onValueChange={(value) => updateSearchParams(query, value)}
        >
          <SelectTrigger aria-label="Filter by tag">
            <SelectValue placeholder="Filter by tag" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All tags</SelectItem>
            {tags.map((tag) => (
              <SelectItem key={tag.id} value={tag.slug}>
                {tag.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {visibleArticles.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {visibleArticles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      ) : (
        <div className="rounded-[2rem] border border-dashed border-[color:var(--border)] bg-[color:var(--surface)] p-10 text-center">
          <h2 className="text-xl font-semibold">No articles match this filter</h2>
          <p className="mt-2 text-sm text-[color:var(--muted-foreground)]">
            Try a different search term or clear the current tag filter.
          </p>
        </div>
      )}
    </div>
  );
}
