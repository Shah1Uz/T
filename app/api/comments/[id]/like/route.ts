import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id: commentId } = await params;

    if (!commentId) {
      return new NextResponse("Comment ID required", { status: 400 });
    }

    const comment = await prisma.comment.findUnique({
      where: { id: commentId }
    });

    if (!comment) {
      return new NextResponse("Comment not found", { status: 404 });
    }

    const existingLike = await prisma.commentLike.findUnique({
      where: {
        userId_commentId: {
          userId,
          commentId
        }
      }
    });

    if (existingLike) {
      // Unlike
      await prisma.commentLike.delete({
        where: {
          id: existingLike.id
        }
      });
      return NextResponse.json({ liked: false });
    } else {
      // Like
      await prisma.commentLike.create({
        data: {
          userId,
          commentId
        }
      });
      return NextResponse.json({ liked: true });
    }
  } catch (error) {
    console.error("[COMMENT_LIKE_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
