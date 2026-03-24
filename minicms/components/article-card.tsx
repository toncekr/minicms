import Link from "next/link";

import type { ArticleSummary } from "@/lib/articles";
import { formatDate } from "@/lib/utils";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type ArticleCardProps = {
  article: ArticleSummary;
};

export function ArticleCard({ article }: ArticleCardProps) {
  return (
    <Card className="h-full transition-transform duration-200 hover:-translate-y-1">
      <CardHeader>
        <div className="flex flex-wrap gap-2">
          {article.categories.map((category) => (
            <Badge key={category.id}>{category.name}</Badge>
          ))}
          {!article.published && <Badge className="bg-[#fef3c7] text-[#92400e]">Draft</Badge>}
        </div>
        <CardTitle className="text-2xl">
          <Link href={`/${article.slug}`} className="hover:text-[color:var(--accent)]">
            {article.title}
          </Link>
        </CardTitle>
        <CardDescription>{article.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {article.tags.map((tag) => (
            <Badge key={tag.id} className="bg-white text-[color:var(--muted-foreground)]">
              #{tag.name}
            </Badge>
          ))}
        </div>
        <div className="flex items-center justify-between text-sm text-[color:var(--muted-foreground)]">
          <span>{article.author.name ?? "Anonymous"}</span>
          <span>{formatDate(article.publishedAt ?? article.createdAt)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
