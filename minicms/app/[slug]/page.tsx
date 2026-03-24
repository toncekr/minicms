import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { getPublishedArticleBySlug, getPublishedArticles } from "@/lib/articles";
import { formatDate } from "@/lib/utils";

type ArticlePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const revalidate = 3600;

export async function generateStaticParams() {
  const articles = await getPublishedArticles();

  return articles.map((article) => ({
    slug: article.slug,
  }));
}

export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getPublishedArticleBySlug(slug);

  if (!article) {
    return {};
  }

  return {
    title: article.title,
    description: article.description,
    alternates: {
      canonical: `/${article.slug}`,
    },
    openGraph: {
      title: article.title,
      description: article.description,
      type: "article",
    },
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = await getPublishedArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-16">
      <article className="rounded-[2.5rem] border border-[color:var(--border)] bg-[color:var(--surface)] p-8 shadow-[0_18px_48px_-28px_rgba(27,40,53,0.28)] sm:p-12">
        <div className="mb-10 space-y-6 border-b border-[color:var(--border)] pb-10">
          <Link
            href="/"
            className="inline-flex text-sm font-medium text-[color:var(--muted-foreground)] hover:text-[color:var(--foreground)]"
          >
            Back to articles
          </Link>
          <div className="flex flex-wrap gap-2">
            {article.categories.map((category) => (
              <Badge key={category.id}>{category.name}</Badge>
            ))}
            {article.tags.map((tag) => (
              <Badge key={tag.id} className="bg-white text-[color:var(--muted-foreground)]">
                #{tag.name}
              </Badge>
            ))}
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">{article.title}</h1>
            <p className="max-w-3xl text-lg leading-8 text-[color:var(--muted-foreground)]">
              {article.description}
            </p>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-[color:var(--muted-foreground)]">
            <span>By {article.author.name ?? "Anonymous"}</span>
            <span>{formatDate(article.publishedAt ?? article.createdAt)}</span>
          </div>
        </div>

        <div className="whitespace-pre-wrap text-base leading-8 text-[color:var(--foreground)]">
          {article.content}
        </div>
      </article>
    </div>
  );
}
