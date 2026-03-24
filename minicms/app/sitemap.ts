import type { MetadataRoute } from "next";

import { getPublishedArticles } from "@/lib/articles";
import { siteConfig } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const articles = await getPublishedArticles();

  return [
    {
      url: siteConfig.url,
      lastModified: new Date(),
    },
    ...articles.map((article) => ({
      url: `${siteConfig.url}/${article.slug}`,
      lastModified: article.updatedAt,
    })),
  ];
}
