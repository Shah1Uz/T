import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { commentSchema } from "@/lib/validations";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const listingId = searchParams.get("listingId");

  if (!listingId) {
    return NextResponse.json({ error: "Missing listingId" }, { status: 400 });
  }

  try {
    const comments = await prisma.comment.findMany({
      where: { listingId, parentId: null },
      include: {
        user: true,
        likes: true,
        replies: {
          include: {
            user: true,
            likes: true,
          },
          orderBy: { createdAt: "asc" }
        }
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validation = commentSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json({ error: "Invalid data", details: validation.error.format() }, { status: 400 });
    }

    const { text, listingId, parentId } = validation.data;

    const comment = await prisma.comment.create({
      data: {
        text,
        listingId,
        userId,
        ...(parentId ? { parentId } : {})
      },
      include: {
        user: true,
        likes: true,
        replies: {
          include: { user: true, likes: true }
        }
      },
    });

    return NextResponse.json(comment);
  } catch (error) {
    console.error("Error creating comment:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
