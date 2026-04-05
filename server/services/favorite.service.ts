import prisma from "@/lib/prisma";

export const favoriteService = {
  async toggle(userId: string, listingId: string) {
    const existing = await prisma.favorite.findUnique({
      where: {
        userId_listingId: { userId, listingId }
      }
    });

    if (existing) {
      return prisma.favorite.delete({
        where: { id: existing.id }
      });
    }

    return prisma.favorite.create({
      data: { userId, listingId }
    });
  },

  async getByUser(userId: string) {
    return prisma.favorite.findMany({
      where: { userId },
      include: {
        listing: {
          include: { images: true, location: true }
        }
      }
    });
  }
};
