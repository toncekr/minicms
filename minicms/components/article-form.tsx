"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { slugify } from "@/lib/utils";
import { articleInputSchema, type ArticleInput } from "@/lib/validation/article";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type ArticleFormProps = {
  articleId?: string;
  initialValues?: Partial<ArticleInput>;
  mode: "create" | "edit";
};

type FormErrors = Partial<Record<keyof ArticleInput, string[]>> & {
  root?: string[];
};

const defaultValues: ArticleInput = {
  title: "",
  slug: "",
  description: "",
  content: "",
  tags: "",
  category: "",
  published: true,
};

function getError(errors: FormErrors, field: keyof ArticleInput) {
  return errors[field]?.[0];
}

export function ArticleForm({
  articleId,
  initialValues,
  mode,
}: ArticleFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<ArticleInput>({
    ...defaultValues,
    ...initialValues,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [slugTouched, setSlugTouched] = useState(Boolean(initialValues?.slug));
  const [isPending, startTransition] = useTransition();

  function assign<K extends keyof ArticleInput>(field: K, value: ArticleInput[K]) {
    setValues((current) => ({
      ...current,
      [field]: value,
    }));
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{mode === "create" ? "Create a new article" : "Update your article"}</CardTitle>
        <CardDescription>
          Drafts stay in the dashboard, and published articles appear on the homepage.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-6"
          onSubmit={(event) => {
            event.preventDefault();
            setErrors({});

            const parsed = articleInputSchema.safeParse(values);

            if (!parsed.success) {
              setErrors(parsed.error.flatten().fieldErrors);
              return;
            }

            startTransition(async () => {
              const response = await fetch(
                articleId ? `/api/articles/${articleId}` : "/api/articles",
                {
                  method: articleId ? "PUT" : "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify(parsed.data),
                },
              );

              if (!response.ok) {
                const payload = (await response.json().catch(() => null)) as
                  | { details?: { fieldErrors?: FormErrors }; error?: string }
                  | null;

                setErrors({
                  ...(payload?.details?.fieldErrors ?? {}),
                  root: payload?.error ? [payload.error] : ["Unable to save the article."],
                });
                return;
              }

              router.push("/dashboard/articles");
              router.refresh();
            });
          }}
        >
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={values.title}
                onChange={(event) => {
                  const nextTitle = event.target.value;
                  assign("title", nextTitle);

                  if (!slugTouched) {
                    assign("slug", slugify(nextTitle));
                  }
                }}
                placeholder="A headline worth reading"
              />
              {getError(errors, "title") ? (
                <p className="text-sm text-[#b42318]">{getError(errors, "title")}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                value={values.slug}
                onChange={(event) => {
                  setSlugTouched(true);
                  assign("slug", slugify(event.target.value));
                }}
                placeholder="article-slug"
              />
              {getError(errors, "slug") ? (
                <p className="text-sm text-[#b42318]">{getError(errors, "slug")}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="published">Status</Label>
              <Select
                value={values.published ? "published" : "draft"}
                onValueChange={(value) => assign("published", value === "published")}
              >
                <SelectTrigger id="published" aria-label="Publishing status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                className="min-h-28"
                value={values.description}
                onChange={(event) => assign("description", event.target.value)}
                placeholder="Write a concise summary for lists, previews, and SEO."
              />
              {getError(errors, "description") ? (
                <p className="text-sm text-[#b42318]">{getError(errors, "description")}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                value={values.tags}
                onChange={(event) => assign("tags", event.target.value)}
                placeholder="nextjs, prisma, auth"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={values.category}
                onChange={(event) => assign("category", event.target.value)}
                placeholder="Engineering"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                className="min-h-80"
                value={values.content}
                onChange={(event) => assign("content", event.target.value)}
                placeholder="Write the full article here."
              />
              {getError(errors, "content") ? (
                <p className="text-sm text-[#b42318]">{getError(errors, "content")}</p>
              ) : null}
            </div>
          </div>

          {errors.root?.[0] ? (
            <p className="rounded-2xl bg-[#fef3f2] px-4 py-3 text-sm text-[#b42318]">
              {errors.root[0]}
            </p>
          ) : null}

          <div className="flex flex-wrap items-center gap-3">
            <Button type="submit" disabled={isPending}>
              {isPending
                ? mode === "create"
                  ? "Creating..."
                  : "Saving..."
                : mode === "create"
                  ? "Create Article"
                  : "Save Changes"}
            </Button>
            <Button asChild variant="ghost">
              <Link href="/dashboard/articles">Cancel</Link>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
