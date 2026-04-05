import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId: currentUserId } = await auth();
  const { userId: receiverId } = await params;

  if (!currentUserId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (currentUserId === receiverId) return NextResponse.json({ error: "Cannot review yourself" }, { status: 400 });

  try {
    const { rating, comment } = await req.json();

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 });
    }

    const review = await prisma.userReview.create({
      data: {
        rating: Number(rating),
        comment,
        reviewerId: currentUserId,
        receiverId: receiverId,
      },
      include: {
        reviewer: true
      }
    });
    
    revalidatePath(`/profile/${receiverId}`);

    return NextResponse.json(review);
  } catch (error) {
    console.error("Review error:", error);
    return NextResponse.json({ error: "Failed to create review" }, { status: 500 });
  }
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;

  try {
    const reviews = await prisma.userReview.findMany({
      where: { receiverId: userId },
      include: {
        reviewer: {
          select: {
            id: true,
            name: true,
            imageUrl: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(reviews);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}
