import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { createArticleData, getPublicArticleFeed, serializeArticle, articleInclude } from "@/lib/articles";
import { prisma } from "@/lib/prisma";
import { articleInputSchema, articleListQuerySchema } from "@/lib/validation/article";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = articleListQuerySchema.safeParse({
    page: searchParams.get("page") ?? undefined,
    pageSize: searchParams.get("pageSize") ?? undefined,
    query: searchParams.get("query") ?? undefined,
    tag: searchParams.get("tag") ?? undefined,
    category: searchParams.get("category") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Invalid article query parameters.",
        details: parsed.error.flatten(),
      },
      { status: 400 },
    );
  }

  const result = await getPublicArticleFeed(parsed.data);

  return NextResponse.json(result);
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

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

  try {
    const article = await prisma.article.create({
      data: createArticleData(parsed.data, session.user.id),
      include: articleInclude,
    });

    revalidatePath("/");
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/articles");
    revalidatePath(`/${article.slug}`);

    return NextResponse.json(serializeArticle(article), { status: 201 });
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
