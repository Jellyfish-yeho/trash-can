import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    const posts = await prisma.post.findMany({
        where: { category: { not: null } },
        select: { category: true },
        distinct: ["category"],
        orderBy: { category: "asc" },
    });

    const categories = posts
        .map((p) => p.category as string)
        .filter(Boolean);

    return NextResponse.json(categories);
}

export async function DELETE(request: NextRequest) {
    const { category } = await request.json() as { category: string };

    if (!category?.trim()) {
        return NextResponse.json({ error: "카테고리명이 없습니다." }, { status: 400 });
    }

    await prisma.post.updateMany({
        where: { category },
        data: { category: null },
    });

    return NextResponse.json({ ok: true });
}