import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const topSellers = await prisma.user.findMany({
      where: {
        isBlocked: false,
        listings: {
          some: {}
        }
      },
      include: {
        _count: {
          select: { listings: true, reviewsReceived: true }
        },
        reviewsReceived: {
          select: { rating: true }
        }
      },
      orderBy: {
        listings: {
          _count: 'desc'
        }
      },
      take: 15
    });

    // Transform data
    const transformed = topSellers.map(user => {
      const avgRating = user.reviewsReceived.length > 0
        ? user.reviewsReceived.reduce((acc, r) => acc + r.rating, 0) / user.reviewsReceived.length
        : 0;

      return {
        id: user.id,
        name: user.name || "Sotuvchi",
        imageUrl: user.imageUrl,
        isVerified: user.isVerified,
        listingCount: user._count.listings,
        avgRating,
        reviewsCount: user._count.reviewsReceived
      };
    });

    return NextResponse.json(transformed);
  } catch (error) {
    console.error("Top sellers error:", error);
    return NextResponse.json({ error: "Failed to fetch top sellers" }, { status: 500 });
  }
}
