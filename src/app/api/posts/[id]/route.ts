import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    await prisma.post.update({
        where: { id },
        data: { delYn: true },  // 실제 삭제 대신 플래그
    });

    return NextResponse.json({ ok: true });
}