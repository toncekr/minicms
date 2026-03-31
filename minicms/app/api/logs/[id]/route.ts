import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { canManageWeedLog } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { serializeWeedLog, updateWeedLogData, weedLogInclude } from "@/lib/weed-logs";
import { weedLogInputSchema } from "@/lib/validation/weed-log";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const weedLog = await prisma.weedLog.findUnique({
    where: { id },
    include: weedLogInclude,
  });

  if (!weedLog) {
    return NextResponse.json({ error: "Log not found." }, { status: 404 });
  }

  return NextResponse.json(serializeWeedLog(weedLog));
}

export async function PUT(request: Request, context: RouteContext) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const { id } = await context.params;
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

  const existing = await prisma.weedLog.findUnique({
    where: { id },
    select: {
      id: true,
      authorId: true,
      slug: true,
    },
  });

  if (!existing) {
    return NextResponse.json({ error: "Log not found." }, { status: 404 });
  }

  if (!canManageWeedLog(session.user, existing.authorId)) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  try {
    const weedLog = await prisma.weedLog.update({
      where: { id },
      data: updateWeedLogData(parsed.data),
      include: weedLogInclude,
    });

    revalidatePath("/");
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/logs");
    revalidatePath(`/logs/${existing.slug}`);
    revalidatePath(`/logs/${weedLog.slug}`);

    return NextResponse.json(serializeWeedLog(weedLog));
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "A log with that slug already exists." }, { status: 409 });
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
  const existing = await prisma.weedLog.findUnique({
    where: { id },
    select: {
      id: true,
      authorId: true,
      slug: true,
    },
  });

  if (!existing) {
    return NextResponse.json({ error: "Log not found." }, { status: 404 });
  }

  if (!canManageWeedLog(session.user, existing.authorId)) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  await prisma.weedLog.delete({
    where: { id },
  });

  revalidatePath("/");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/logs");
  revalidatePath(`/logs/${existing.slug}`);

  return NextResponse.json({ success: true });
}
