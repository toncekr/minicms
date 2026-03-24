import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import {
  normalizeCategoryInput,
  parseTagInput,
  type ArticleInput,
  type ArticleListQuery,
} from "@/lib/validation/article";

export const articleInclude = {
  author: {
    select: {
      id: true,
      name: true,
      image: true,
    },
  },
  tags: {
    include: {
      tag: true,
    },
  },
  categories: {
    include: {
      category: true,
    },
  },
} satisfies Prisma.ArticleInclude;

type ArticleRecord = Prisma.ArticleGetPayload<{
  include: typeof articleInclude;
}>;

function buildTagRelations(value: string) {
  return parseTagInput(value).map((name) => {
    const slug = slugify(name);

    return {
      tag: {
        connectOrCreate: {
          where: { slug },
          create: { name, slug },
        },
      },
    };
  });
}

function buildCategoryRelations(value: string) {
  const name = normalizeCategoryInput(value);

  if (!name) {
    return [];
  }

  const slug = slugify(name);

  return [
    {
      category: {
        connectOrCreate: {
          where: { slug },
          create: { name, slug },
        },
      },
    },
  ];
}

export function serializeArticle(article: ArticleRecord) {
  return {
    id: article.id,
    title: article.title,
    slug: article.slug,
    description: article.description,
    content: article.content,
    published: article.published,
    publishedAt: article.publishedAt?.toISOString() ?? null,
    createdAt: article.createdAt.toISOString(),
    updatedAt: article.updatedAt.toISOString(),
    author: article.author,
    tags: article.tags.map(({ tag }) => tag),
    categories: article.categories.map(({ category }) => category),
  };
}

export type ArticleSummary = ReturnType<typeof serializeArticle>;

export async function getPublishedArticles() {
  const articles = await prisma.article.findMany({
    where: { published: true },
    include: articleInclude,
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
  });

  return articles.map(serializeArticle);
}

export async function getPublishedArticleBySlug(slug: string) {
  const article = await prisma.article.findFirst({
    where: {
      slug,
      published: true,
    },
    include: articleInclude,
  });

  return article ? serializeArticle(article) : null;
}

export async function getArticleByIdForAuthor(id: string, authorId: string) {
  const article = await prisma.article.findFirst({
    where: {
      id,
      authorId,
    },
    include: articleInclude,
  });

  return article ? serializeArticle(article) : null;
}

export async function getUserArticles(authorId: string) {
  const articles = await prisma.article.findMany({
    where: { authorId },
    include: articleInclude,
    orderBy: [{ updatedAt: "desc" }],
  });

  return articles.map(serializeArticle);
}

export async function getDashboardOverview(authorId: string) {
  const [articleCount, publishedCount, recentDrafts] = await prisma.$transaction([
    prisma.article.count({
      where: { authorId },
    }),
    prisma.article.count({
      where: {
        authorId,
        published: true,
      },
    }),
    prisma.article.findMany({
      where: {
        authorId,
        published: false,
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: 5,
      include: articleInclude,
    }),
  ]);

  return {
    articleCount,
    publishedCount,
    draftCount: articleCount - publishedCount,
    recentDrafts: recentDrafts.map(serializeArticle),
  };
}

export function createArticleData(input: ArticleInput, authorId: string): Prisma.ArticleCreateInput {
  return {
    title: input.title,
    slug: input.slug,
    description: input.description,
    content: input.content,
    published: input.published,
    publishedAt: input.published ? new Date() : null,
    author: {
      connect: {
        id: authorId,
      },
    },
    tags: {
      create: buildTagRelations(input.tags),
    },
    categories: {
      create: buildCategoryRelations(input.category),
    },
  };
}

export function updateArticleData(
  input: ArticleInput,
  previousPublishedAt: Date | null,
): Prisma.ArticleUpdateInput {
  return {
    title: input.title,
    slug: input.slug,
    description: input.description,
    content: input.content,
    published: input.published,
    publishedAt: input.published ? previousPublishedAt ?? new Date() : null,
    tags: {
      deleteMany: {},
      create: buildTagRelations(input.tags),
    },
    categories: {
      deleteMany: {},
      create: buildCategoryRelations(input.category),
    },
  };
}

export async function getPublicArticleFeed(filters: ArticleListQuery) {
  const query = filters.query?.trim();
  const tag = filters.tag?.trim();
  const category = filters.category?.trim();

  const where: Prisma.ArticleWhereInput = {
    published: true,
    ...(query
      ? {
          OR: [
            { title: { contains: query } },
            { description: { contains: query } },
            { content: { contains: query } },
          ],
        }
      : {}),
    ...(tag
      ? {
          tags: {
            some: {
              tag: {
                slug: tag,
              },
            },
          },
        }
      : {}),
    ...(category
      ? {
          categories: {
            some: {
              category: {
                slug: category,
              },
            },
          },
        }
      : {}),
  };

  const [items, total] = await prisma.$transaction([
    prisma.article.findMany({
      where,
      include: articleInclude,
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      skip: (filters.page - 1) * filters.pageSize,
      take: filters.pageSize,
    }),
    prisma.article.count({ where }),
  ]);

  return {
    items: items.map(serializeArticle),
    total,
    page: filters.page,
    pageSize: filters.pageSize,
    totalPages: Math.max(1, Math.ceil(total / filters.pageSize)),
  };
}
