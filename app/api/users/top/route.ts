import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const topSellers = await prisma.user.findMany({
      include: {
        listings: {
          select: { id: true }
        },
        reviewsReceived: {
          select: { rating: true }
        }
      },
      take: 20
    });

    // Transform and sort by listing count
    const sorted = topSellers
      .map(user => {
        const avgRating = user.reviewsReceived.length > 0
          ? user.reviewsReceived.reduce((acc, r) => acc + r.rating, 0) / user.reviewsReceived.length
          : 0;
        
        return {
          id: user.id,
          name: user.name,
          imageUrl: user.imageUrl,
          isVerified: user.isVerified,
          listingCount: user.listings.length,
          avgRating,
          reviewsCount: user.reviewsReceived.length
        };
      })
      .sort((a, b) => b.listingCount - a.listingCount)
      .slice(0, 10);

    return NextResponse.json(sorted);
  } catch (error) {
    console.error("Top sellers error:", error);
    return NextResponse.json({ error: "Failed to fetch top sellers" }, { status: 500 });
  }
}
