import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { auth } from "@/auth";
import {
  createWeedLogData,
  getPublicWeedLogFeed,
  serializeWeedLog,
  weedLogInclude,
} from "@/lib/weed-logs";
import { prisma } from "@/lib/prisma";
import { weedLogInputSchema, weedLogListQuerySchema } from "@/lib/validation/weed-log";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = weedLogListQuerySchema.safeParse({
    page: searchParams.get("page") ?? undefined,
    pageSize: searchParams.get("pageSize") ?? undefined,
    query: searchParams.get("query") ?? undefined,
    tag: searchParams.get("tag") ?? undefined,
    type: searchParams.get("type") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Invalid log query parameters.",
        details: parsed.error.flatten(),
      },
      { status: 400 },
    );
  }

  const result = await getPublicWeedLogFeed(parsed.data);

  return NextResponse.json(result);
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const parsed = weedLogInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Invalid weed log payload.",
        details: parsed.error.flatten(),
      },
      { status: 400 },
    );
  }

  try {
    const weedLog = await prisma.weedLog.create({
      data: createWeedLogData(parsed.data, session.user.id),
      include: weedLogInclude,
    });

    revalidatePath("/");
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/logs");
    revalidatePath(`/logs/${weedLog.slug}`);

    return NextResponse.json(serializeWeedLog(weedLog), { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "A log with that slug already exists." }, { status: 409 });
    }

    throw error;
  }
}
