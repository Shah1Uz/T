import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ reviewId: string }> }
) {
  const { userId } = await auth();
  const { reviewId } = await params;

  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const review = await prisma.userReview.findUnique({
      where: { id: reviewId }
    });

    if (!review) return NextResponse.json({ error: "Review not found" }, { status: 404 });
    if (review.reviewerId !== userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    await prisma.userReview.delete({
      where: { id: reviewId }
    });

    revalidatePath(`/profile/${review.receiverId}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete review error:", error);
    return NextResponse.json({ error: "Failed to delete review" }, { status: 500 });
  }
}
