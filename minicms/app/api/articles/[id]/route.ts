import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { articleInclude, serializeArticle, updateArticleData } from "@/lib/articles";
import { prisma } from "@/lib/prisma";
import { articleInputSchema } from "@/lib/validation/article";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const session = await auth();

  const article = await prisma.article.findUnique({
    where: { id },
    include: articleInclude,
  });

  if (!article) {
    return NextResponse.json({ error: "Article not found." }, { status: 404 });
  }

  if (!article.published && article.authorId !== session?.user?.id) {
    return NextResponse.json({ error: "Article not found." }, { status: 404 });
  }

  return NextResponse.json(serializeArticle(article));
}

export async function PUT(request: Request, context: RouteContext) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const { id } = await context.params;
  const body = await request.json();
  const parsed = articleInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Invalid article payload.",
        details: parsed.error.flatten(),
      },
      { status: 400 },
    );
  }

  const existing = await prisma.article.findUnique({
    where: { id },
    select: {
      id: true,
      authorId: true,
      slug: true,
      publishedAt: true,
    },
  });

  if (!existing) {
    return NextResponse.json({ error: "Article not found." }, { status: 404 });
  }

  if (existing.authorId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  try {
    const article = await prisma.article.update({
      where: { id },
      data: updateArticleData(parsed.data, existing.publishedAt),
      include: articleInclude,
    });

    revalidatePath("/");
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/articles");
    revalidatePath(`/${existing.slug}`);
    revalidatePath(`/${article.slug}`);

    return NextResponse.json(serializeArticle(article));
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "An article with that slug already exists." },
        { status: 409 },
      );
    }

    throw error;
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const { id } = await context.params;
  const existing = await prisma.article.findUnique({
    where: { id },
    select: {
      id: true,
      authorId: true,
      slug: true,
    },
  });

  if (!existing) {
    return NextResponse.json({ error: "Article not found." }, { status: 404 });
  }

  if (existing.authorId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  await prisma.article.delete({
    where: { id },
  });

  revalidatePath("/");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/articles");
  revalidatePath(`/${existing.slug}`);

  return NextResponse.json({ success: true });
}
