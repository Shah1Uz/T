import prisma from "@/lib/prisma";

export const ratingService = {
  async rate(listingId: string, userId: string, rating: number) {
    // 1. Upsert the rating
    await prisma.listingRating.upsert({
      where: {
        userId_listingId: {
          userId,
          listingId,
        },
      },
      update: {
        rating,
      },
      create: {
        userId,
        listingId,
        rating,
      },
    });

    // 2. Recalculate average and count
    const aggregations = await prisma.listingRating.aggregate({
      where: { listingId },
      _avg: {
        rating: true,
      },
      _count: {
        rating: true,
      },
    });

    // 3. Update the Listing model
    return prisma.listing.update({
      where: { id: listingId },
      data: {
        ratingAverage: aggregations._avg.rating || 0,
        ratingCount: aggregations._count.rating || 0,
      },
    });
  },

  async getRating(listingId: string, userId?: string) {
    if (!userId) {
      const listing = await prisma.listing.findUnique({
        where: { id: listingId },
        select: { ratingAverage: true, ratingCount: true }
      });
      return { ratingAverage: listing?.ratingAverage || 0, ratingCount: listing?.ratingCount || 0, userRating: null };
    }

    const [listing, userRating] = await Promise.all([
      prisma.listing.findUnique({
        where: { id: listingId },
        select: { ratingAverage: true, ratingCount: true }
      }),
      prisma.listingRating.findUnique({
        where: {
          userId_listingId: {
            userId,
            listingId,
          },
        },
        select: { rating: true }
      })
    ]);

    return {
      ratingAverage: listing?.ratingAverage || 0,
      ratingCount: listing?.ratingCount || 0,
      userRating: userRating?.rating || null
    };
  }
};
