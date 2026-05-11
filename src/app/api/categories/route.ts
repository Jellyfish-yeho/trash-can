import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    const categories = await prisma.category.findMany({
        orderBy: { name: "asc" },
    });
    return NextResponse.json(categories.map((c) => c.name));
}

export async function DELETE(request: NextRequest) {
    const { category } = await request.json() as { category: string };

    if (!category?.trim()) {
        return NextResponse.json({ error: "카테고리명이 없습니다." }, { status: 400 });
    }

    await prisma.category.delete({ where: { name: category } });

    return NextResponse.json({ ok: true });
}