import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { ArticleForm } from "@/components/article-form";

export default async function NewArticlePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/api/auth/signin?callbackUrl=/dashboard/articles/new");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Create article</h1>
        <p className="mt-2 text-[color:var(--muted-foreground)]">
          Add a new article, save it as a draft, or publish it immediately.
        </p>
      </div>
      <ArticleForm mode="create" />
    </div>
  );
}
