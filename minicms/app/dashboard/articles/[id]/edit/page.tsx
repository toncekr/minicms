import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
import { ArticleForm } from "@/components/article-form";
import { getArticleByIdForAuthor } from "@/lib/articles";

type EditArticlePageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditArticlePage({ params }: EditArticlePageProps) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/api/auth/signin?callbackUrl=/dashboard/articles");
  }

  const { id } = await params;
  const article = await getArticleByIdForAuthor(id, session.user.id);

  if (!article) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Edit article</h1>
        <p className="mt-2 text-[color:var(--muted-foreground)]">
          Update the content, publishing status, and article metadata.
        </p>
      </div>
      <ArticleForm
        mode="edit"
        articleId={article.id}
        initialValues={{
          title: article.title,
          slug: article.slug,
          description: article.description,
          content: article.content,
          tags: article.tags.map((tag) => tag.name).join(", "),
          category: article.categories[0]?.name ?? "",
          published: article.published,
        }}
      />
    </div>
  );
}
