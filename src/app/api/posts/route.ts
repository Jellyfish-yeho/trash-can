import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sort = searchParams.get("sort") ?? "latest";
  const date = searchParams.get("date");

  const where = date
    ? {
        date: {
          gte: new Date(`${date}T00:00:00+09:00`),
          lte: new Date(`${date}T23:59:59+09:00`),
        },
      }
    : {};

  const orderBy =
    sort === "oldest"
      ? { date: "asc" as const }
      : sort === "popular"
      ? { likes: { _count: "desc" as const } }
      : { date: "desc" as const };

  const posts = await prisma.post.findMany({
    where,
    orderBy,
    include: {
      _count: { select: { likes: true, comments: true } },
      comments: {
        include: { _count: { select: { likes: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  return NextResponse.json(posts);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { content, category, date } = body as {
    content: string;
    category?: string;
    date?: string;
  };

  if (!content?.trim()) {
    return NextResponse.json({ error: "내용을 입력해주세요." }, { status: 400 });
  }

  const post = await prisma.post.create({
    data: {
      content: content.trim(),
      category: category?.trim() || null,
      date: date ? new Date(date) : new Date(),
    },
    include: {
      _count: { select: { likes: true, comments: true } },
      comments: { include: { _count: { select: { likes: true } } } },
    },
  });

  return NextResponse.json(post, { status: 201 });
}
