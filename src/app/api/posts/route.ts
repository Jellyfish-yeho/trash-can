import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {randomCategoryColor} from "@/lib/category-colors";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const sort = searchParams.get("sort") ?? "latest";

    const orderBy =
        sort === "oldest"
            ? { createdAt: "asc" as const }
            : sort === "popular"
                ? { likes: { _count: "desc" as const } }
                : { createdAt: "desc" as const };

    const posts = await prisma.post.findMany({
        where: { delYn: false },
        orderBy,
        include: {
            category: true,
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
    const { content, category, categoryColor } = body as {
        content: string;
        category?: string;
        categoryColor?: string;
    };

    if (!content?.trim()) {
        return NextResponse.json({ error: "내용을 입력해주세요." }, { status: 400 });
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
        },
        include: {
            category: true,
            _count: { select: { likes: true, comments: true } },
            comments: { include: { _count: { select: { likes: true } } } },
        },
    });

    return NextResponse.json(post, { status: 201 });
}