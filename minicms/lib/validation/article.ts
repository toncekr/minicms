import { z } from "zod";

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const articleInputSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters.").max(140),
  slug: z
    .string()
    .trim()
    .min(3, "Slug must be at least 3 characters.")
    .max(160)
    .regex(slugPattern, "Use lowercase letters, numbers, and single hyphens only."),
  description: z
    .string()
    .trim()
    .min(12, "Description must be at least 12 characters.")
    .max(240),
  content: z.string().trim().min(40, "Content must be at least 40 characters."),
  tags: z.string().trim().max(240).default(""),
  category: z.string().trim().max(80).default(""),
  published: z.boolean().default(true),
});

export const articleListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(24).default(12),
  query: z.string().trim().max(120).optional(),
  tag: z.string().trim().max(80).optional(),
  category: z.string().trim().max(80).optional(),
});

export type ArticleInput = z.infer<typeof articleInputSchema>;
export type ArticleListQuery = z.infer<typeof articleListQuerySchema>;

export function parseTagInput(value: string) {
  return Array.from(
    new Set(
      value
        .split(",")
        .map((part) => part.trim())
        .filter(Boolean),
    ),
  );
}

export function normalizeCategoryInput(value: string) {
  return value.trim();
}
