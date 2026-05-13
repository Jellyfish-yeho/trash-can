import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {randomCategoryColor} from "@/lib/category-colors";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const sort = searchParams.get("sort") ?? "latest";
    const cursor = searchParams.get("cursor") ?? undefined;
    const take = 20;

    const orderBy =
        sort === "oldest"
            ? { createdAt: "asc" as const }
            : sort === "popular"
                ? { likes: { _count: "desc" as const } }
                : { createdAt: "desc" as const };

    const posts = await prisma.post.findMany({
        where: { delYn: false },
        orderBy,
        take: take + 1, // 1개 더 가져와서 다음 페이지 있는지 확인
        ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
        include: {
            category: true,
            _count: { select: { likes: true, comments: true } },
            comments: {
                include: { _count: { select: { likes: true } } },
                orderBy: { createdAt: "asc" },
            },
        },
    });

    const hasMore = posts.length > take;
    const data = hasMore ? posts.slice(0, take) : posts;
    const nextCursor = hasMore ? data[data.length - 1].id : null;

    return NextResponse.json({ posts: data, nextCursor });
}

export async function POST(request: NextRequest) {
    const body = await request.json();
    const { content, category, categoryColor, imageUrl } = body as {
        content: string;
        category?: string;
        categoryColor?: string;
        imageUrl?: string;
    };

    if (!content?.trim()) {
        return NextResponse.json({ error: "내용을 입력해주세요." }, { status: 400 });
    }

    if (content.length > 300) {
        return NextResponse.json({ error: "글자수 초과입니다." }, { status: 400 });
    }

    let categoryId: string | null = null;
    if (category?.trim()) {
        const cat = await prisma.category.upsert({
            where: { name: category.trim() },
            update: {},
            create: {
                name: category.trim(),
                color: categoryColor || randomCategoryColor(),
            },
        });
        categoryId = cat.id;
    }

    const post = await prisma.post.create({
        data: {
            content: content.trim(),
            categoryId,
            imageUrl: imageUrl ?? null,
        },
        include: {
            category: true,
            _count: { select: { likes: true, comments: true } },
            comments: { include: { _count: { select: { likes: true } } } },
        },
    });

    return NextResponse.json(post, { status: 201 });
}