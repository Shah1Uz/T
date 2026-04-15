import prisma from "@/lib/prisma";

export const newsService = {
  async getAll() {
    return prisma.news.findMany({
      orderBy: { createdAt: "desc" }
    });
  },

  async getById(id: string) {
    return prisma.news.findUnique({
      where: { id }
    });
  },

  async create(data: {
    titleUz: string;
    titleRu: string;
    excerptUz: string;
    excerptRu: string;
    contentUz?: string;
    contentRu?: string;
    imageUrl: string;
    categoryUz: string;
    categoryRu: string;
  }) {
    return prisma.news.create({
      data
    });
  },

  async update(id: string, data: Partial<{
    titleUz: string;
    titleRu: string;
    excerptUz: string;
    excerptRu: string;
    contentUz: string;
    contentRu: string;
    imageUrl: string;
    categoryUz: string;
    categoryRu: string;
  }>) {
    return prisma.news.update({
      where: { id },
      data
    });
  },

  async delete(id: string) {
    return prisma.news.delete({
      where: { id }
    });
  }
};
