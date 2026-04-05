import prisma from "@/lib/prisma";

export const storyService = {

  async create(data: { imageUrl?: string; videoUrl?: string; userId: string }) {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    return prisma.story.create({
      data: {
        ...data,
        expiresAt
      }
    });
  },

  async delete(id: string) {
    return prisma.story.delete({
      where: { id }
    });
  },

  async getAll() {
    return await prisma.story.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: true,
        _count: {
          select: { views: true, likes: true }
        }
      }
    });
  },

  async getActive() {
    const now = new Date();
    return await prisma.story.findMany({
      where: {
        expiresAt: { gt: now },
        user: { isBlocked: false }
      },
      orderBy: { createdAt: "asc" },
      include: {
        user: true,
        _count: {
          select: { views: true, likes: true }
        }
      }
    });
  },

  async recordView(storyId: string, userId: string) {
    try {
      return await prisma.storyView.upsert({
        where: {
          storyId_userId: { storyId, userId }
        },
        create: {
          storyId,
          userId
        },
        update: {
          viewedAt: new Date()
        }
      });
    } catch (error) {
      console.error("Error recording story view:", error);
      return null;
    }
  },

  async getStoryViews(storyId: string) {
    return await prisma.storyView.findMany({
      where: { storyId },
      include: {
        user: true
      },
      orderBy: { viewedAt: "desc" }
    });
  },

  async toggleLike(storyId: string, userId: string) {
    const existing = await prisma.storyLike.findUnique({
      where: {
        storyId_userId: { storyId, userId }
      }
    });

    if (existing) {
      return await prisma.storyLike.delete({
        where: { id: existing.id }
      });
    }

    return await prisma.storyLike.create({
      data: { storyId, userId }
    });
  },

  async getStoryLikes(storyId: string) {
    return await prisma.storyLike.findMany({
      where: { storyId },
      include: {
        user: true
      },
      orderBy: { createdAt: "desc" }
    });
  },

  async isLikedByUser(storyId: string, userId: string) {
    if (!userId) return false;
    const like = await prisma.storyLike.findUnique({
      where: {
        storyId_userId: { storyId, userId }
      }
    });
    return !!like;
  },
};
