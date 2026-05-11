import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  await prisma.commentLike.create({ data: { commentId: id } });

  const count = await prisma.commentLike.count({ where: { commentId: id } });
  return NextResponse.json({ count });
}
