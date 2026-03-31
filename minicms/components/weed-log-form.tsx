"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { slugify } from "@/lib/utils";
import {
  weedLogInputSchema,
  weedTypeOptions,
  type WeedLogInput,
} from "@/lib/validation/weed-log";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type WeedLogFormProps = {
  weedLogId?: string;
  initialValues?: Partial<WeedLogInput>;
  mode: "create" | "edit";
};

type FormErrors = Partial<Record<keyof WeedLogInput, string[]>> & {
  root?: string[];
};

const defaultValues: WeedLogInput = {
  title: "",
  slug: "",
  strain: "",
  type: "Hybrid",
  rating: 7,
  content: "",
  tags: "",
  imageUrl: "",
};

function getError(errors: FormErrors, field: keyof WeedLogInput) {
  return errors[field]?.[0];
}

export function WeedLogForm({
  weedLogId,
  initialValues,
  mode,
}: WeedLogFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<WeedLogInput>({
    ...defaultValues,
    ...initialValues,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [slugTouched, setSlugTouched] = useState(Boolean(initialValues?.slug));
  const [isPending, startTransition] = useTransition();
  const [isUploading, startUploadTransition] = useTransition();

  function assign<K extends keyof WeedLogInput>(field: K, value: WeedLogInput[K]) {
    setValues((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function setRootError(message: string) {
    setErrors((current) => ({
      ...current,
      root: [message],
    }));
  }

  async function uploadImage(file: File) {
    if (!file.type.startsWith("image/")) {
      setRootError("Only image uploads are allowed.");
      return;
    }

    if (file.size > 4 * 1024 * 1024) {
      setRootError("Images must be 4 MB or smaller.");
      return;
    }

    try {
      const response = await fetch(`/api/upload?filename=${encodeURIComponent(file.name)}`, {
        method: "POST",
        headers: {
          "Content-Type": file.type,
        },
        body: file,
      });

      const payload = (await response.json().catch(() => null)) as
        | { error?: string; url?: string }
        | null;

      if (!response.ok || !payload?.url) {
        setRootError(payload?.error ?? "Unable to upload the image.");
        return;
      }

      setErrors((current) => ({
        ...current,
        root: undefined,
      }));
      assign("imageUrl", payload.url);
    } catch {
      setRootError("Unable to upload the image right now.");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{mode === "create" ? "New weed log" : "Edit weed log"}</CardTitle>
        <CardDescription>
          Add the strain, type, rating, notes, tags, and an optional photo.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-6"
          onSubmit={(event) => {
            event.preventDefault();
            setErrors({});

            const parsed = weedLogInputSchema.safeParse(values);

            if (!parsed.success) {
              setErrors(parsed.error.flatten().fieldErrors);
              return;
            }

            startTransition(async () => {
              try {
                const response = await fetch(weedLogId ? `/api/logs/${weedLogId}` : "/api/logs", {
                  method: weedLogId ? "PUT" : "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify(parsed.data),
                });

                if (!response.ok) {
                  const payload = (await response.json().catch(() => null)) as
                    | { details?: { fieldErrors?: FormErrors }; error?: string }
                    | null;

                  setErrors({
                    ...(payload?.details?.fieldErrors ?? {}),
                    root: payload?.error ? [payload.error] : ["Unable to save this log."],
                  });
                  return;
                }

                router.push("/dashboard/logs");
                router.refresh();
              } catch {
                setErrors({
                  root: ["Unable to save this log right now."],
                });
              }
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
                placeholder="Sticky citrus hybrid with a calm head high"
              />
              {getError(errors, "title") ? (
                <p className="text-sm text-[#ff8b8b]">{getError(errors, "title")}</p>
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
                placeholder="sticky-citrus-hybrid"
              />
              {getError(errors, "slug") ? (
                <p className="text-sm text-[#ff8b8b]">{getError(errors, "slug")}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="strain">Strain</Label>
              <Input
                id="strain"
                value={values.strain}
                onChange={(event) => assign("strain", event.target.value)}
                placeholder="Blue Dream"
              />
              {getError(errors, "strain") ? (
                <p className="text-sm text-[#ff8b8b]">{getError(errors, "strain")}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select value={values.type} onValueChange={(value) => assign("type", value)}>
                <SelectTrigger id="type" aria-label="Weed type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {weedTypeOptions.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {getError(errors, "type") ? (
                <p className="text-sm text-[#ff8b8b]">{getError(errors, "type")}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="rating">Rating</Label>
              <Input
                id="rating"
                type="number"
                min={1}
                max={10}
                value={values.rating}
                onChange={(event) => assign("rating", Number(event.target.value || 0))}
              />
              {getError(errors, "rating") ? (
                <p className="text-sm text-[#ff8b8b]">{getError(errors, "rating")}</p>
              ) : null}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                value={values.tags}
                onChange={(event) => assign("tags", event.target.value)}
                placeholder="relaxed, citrus, pine, munchies"
              />
            </div>

            <div className="space-y-3 md:col-span-2">
              <div className="space-y-2">
                <Label htmlFor="image">Photo</Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  disabled={isUploading}
                  onChange={(event) => {
                    const file = event.target.files?.[0];

                    if (!file) {
                      return;
                    }

                    startUploadTransition(() => {
                      void uploadImage(file);
                    });
                  }}
                />
                <p className="text-sm text-[color:var(--muted-foreground)]">
                  Upload an image up to 4 MB. It will be stored in Vercel Blob.
                </p>
                {getError(errors, "imageUrl") ? (
                  <p className="text-sm text-[#ff8b8b]">{getError(errors, "imageUrl")}</p>
                ) : null}
              </div>

              {values.imageUrl ? (
                <div className="overflow-hidden rounded-[1.5rem] border border-[color:var(--border)] bg-[color:var(--surface-elevated)]">
                  <Image
                    src={values.imageUrl}
                    alt="Upload preview"
                    width={1200}
                    height={900}
                    className="h-64 w-full object-cover"
                  />
                  <div className="flex items-center justify-between gap-3 p-4">
                    <p className="truncate text-sm text-[color:var(--muted-foreground)]">
                      {values.imageUrl}
                    </p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => assign("imageUrl", "")}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="content">Notes</Label>
              <Textarea
                id="content"
                className="min-h-56"
                value={values.content}
                onChange={(event) => assign("content", event.target.value)}
                placeholder="How did it smell, taste, and hit? What kind of high did you get?"
              />
              {getError(errors, "content") ? (
                <p className="text-sm text-[#ff8b8b]">{getError(errors, "content")}</p>
              ) : null}
            </div>
          </div>

          {errors.root?.[0] ? (
            <p className="rounded-2xl border border-[#7f1d1d] bg-[#2d1111] px-4 py-3 text-sm text-[#ffb4b4]">
              {errors.root[0]}
            </p>
          ) : null}

          <div className="flex flex-wrap items-center gap-3">
            <Button type="submit" disabled={isPending || isUploading}>
              {isUploading
                ? "Uploading..."
                : isPending
                  ? mode === "create"
                    ? "Posting..."
                    : "Saving..."
                  : mode === "create"
                    ? "Post log"
                    : "Save changes"}
            </Button>
            <Button asChild variant="ghost">
              <Link href="/dashboard/logs">Cancel</Link>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
