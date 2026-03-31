import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import {
  parseTagInput,
  type WeedLogInput,
  type WeedLogListQuery,
} from "@/lib/validation/weed-log";

export const weedLogInclude = {
  author: {
    select: {
      id: true,
      name: true,
      image: true,
      role: true,
    },
  },
  tags: {
    include: {
      tag: true,
    },
  },
} satisfies Prisma.WeedLogInclude;

type WeedLogRecord = Prisma.WeedLogGetPayload<{
  include: typeof weedLogInclude;
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

export function serializeWeedLog(weedLog: WeedLogRecord) {
  return {
    id: weedLog.id,
    title: weedLog.title,
    slug: weedLog.slug,
    content: weedLog.content,
    strain: weedLog.strain,
    type: weedLog.type,
    rating: weedLog.rating,
    imageUrl: weedLog.imageUrl,
    createdAt: weedLog.createdAt.toISOString(),
    updatedAt: weedLog.updatedAt.toISOString(),
    author: weedLog.author,
    tags: weedLog.tags.map(({ tag }) => tag),
  };
}

export type WeedLogSummary = ReturnType<typeof serializeWeedLog>;

export async function getRecentWeedLogs(limit?: number) {
  const weedLogs = await prisma.weedLog.findMany({
    include: weedLogInclude,
    orderBy: [{ createdAt: "desc" }],
    ...(typeof limit === "number" ? { take: limit } : {}),
  });

  return weedLogs.map(serializeWeedLog);
}

export async function getWeedLogBySlug(slug: string) {
  const weedLog = await prisma.weedLog.findUnique({
    where: { slug },
    include: weedLogInclude,
  });

  return weedLog ? serializeWeedLog(weedLog) : null;
}

export async function getWeedLogById(id: string) {
  const weedLog = await prisma.weedLog.findUnique({
    where: { id },
    include: weedLogInclude,
  });

  return weedLog ? serializeWeedLog(weedLog) : null;
}

export async function getWeedLogByIdForEditing(id: string) {
  return prisma.weedLog.findUnique({
    where: { id },
    include: weedLogInclude,
  });
}

export async function getUserWeedLogs(userId: string, role: string) {
  const weedLogs = await prisma.weedLog.findMany({
    where: role === "ADMIN" ? undefined : { authorId: userId },
    include: weedLogInclude,
    orderBy: [{ updatedAt: "desc" }],
  });

  return weedLogs.map(serializeWeedLog);
}

export async function getDashboardOverview(userId: string, role: string) {
  const where = role === "ADMIN" ? {} : { authorId: userId };

  const [logCount, photoCount, averageRating, recentLogs] = await prisma.$transaction([
    prisma.weedLog.count({ where }),
    prisma.weedLog.count({
      where: {
        ...where,
        imageUrl: {
          not: null,
        },
      },
    }),
    prisma.weedLog.aggregate({
      where,
      _avg: {
        rating: true,
      },
    }),
    prisma.weedLog.findMany({
      where,
      include: weedLogInclude,
      orderBy: {
        updatedAt: "desc",
      },
      take: 5,
    }),
  ]);

  return {
    logCount,
    photoCount,
    averageRating: averageRating._avg.rating,
    recentLogs: recentLogs.map(serializeWeedLog),
  };
}

export function createWeedLogData(
  input: WeedLogInput,
  authorId: string,
): Prisma.WeedLogCreateInput {
  return {
    title: input.title,
    slug: input.slug,
    content: input.content,
    strain: input.strain,
    type: input.type,
    rating: input.rating,
    imageUrl: input.imageUrl || null,
    author: {
      connect: {
        id: authorId,
      },
    },
    tags: {
      create: buildTagRelations(input.tags),
    },
  };
}

export function updateWeedLogData(input: WeedLogInput): Prisma.WeedLogUpdateInput {
  return {
    title: input.title,
    slug: input.slug,
    content: input.content,
    strain: input.strain,
    type: input.type,
    rating: input.rating,
    imageUrl: input.imageUrl || null,
    tags: {
      deleteMany: {},
      create: buildTagRelations(input.tags),
    },
  };
}

export async function getPublicWeedLogFeed(filters: WeedLogListQuery) {
  const query = filters.query?.trim();
  const tag = filters.tag?.trim();
  const type = filters.type?.trim();

  const where: Prisma.WeedLogWhereInput = {
    ...(query
      ? {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { strain: { contains: query, mode: "insensitive" } },
            { content: { contains: query, mode: "insensitive" } },
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
    ...(type && type !== "all"
      ? {
          type,
        }
      : {}),
  };

  const [items, total] = await prisma.$transaction([
    prisma.weedLog.findMany({
      where,
      include: weedLogInclude,
      orderBy: [{ createdAt: "desc" }],
      skip: (filters.page - 1) * filters.pageSize,
      take: filters.pageSize,
    }),
    prisma.weedLog.count({ where }),
  ]);

  return {
    items: items.map(serializeWeedLog),
    total,
    page: filters.page,
    pageSize: filters.pageSize,
    totalPages: Math.max(1, Math.ceil(total / filters.pageSize)),
  };
}
