import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  await prisma.postLike.create({ data: { postId: id } });

  const count = await prisma.postLike.count({ where: { postId: id } });
  return NextResponse.json({ count });
}
