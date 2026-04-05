import prisma from "@/lib/prisma";

export const commentService = {
  async create(text: string, userId: string, listingId: string) {
    return prisma.comment.create({
      data: {
        text,
        userId,
        listingId,
      },
      include: {
        user: true,
      },
    });
  },

  async getByListing(listingId: string) {
    return prisma.comment.findMany({
      where: { listingId },
      include: { user: true },
      orderBy: { createdAt: "desc" },
    });
  },

  async delete(id: string, userId: string) {
    const comment = await prisma.comment.findUnique({ where: { id } });
    if (!comment || comment.userId !== userId) throw new Error("Unauthorized");
    
    return prisma.comment.delete({ where: { id } });
  }
};
