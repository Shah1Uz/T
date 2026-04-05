import prisma from "@/lib/prisma";

export const bannerService = {
  async getAll() {
    return prisma.banner.findMany({
      orderBy: { order: "asc" },
    });
  },

  async getActive() {
    return prisma.banner.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
    });
  },

  async create(data: { 
    imageUrl: string; 
    title?: string;
    subtext?: string;
    buttonText?: string;
    bgPattern?: string;
    bgColor?: string;
    link?: string; 
    isActive?: boolean; 
    order?: number; 
    width?: string; 
    height?: string; 
    duration?: number 
  }) {
    return prisma.banner.create({
      data,
    });
  },

  async update(id: string, data: Partial<{ 
    imageUrl: string; 
    title: string;
    subtext: string;
    buttonText: string;
    bgPattern: string;
    bgColor: string;
    link: string; 
    isActive: boolean; 
    order: number; 
    width: string; 
    height: string; 
    duration: number 
  }>) {
    return prisma.banner.update({
      where: { id },
      data,
    });
  },

  async delete(id: string) {
    return prisma.banner.delete({
      where: { id },
    });
  },

  async toggleActive(id: string, isActive: boolean) {
    return prisma.banner.update({
      where: { id },
      data: { isActive },
    });
  }
};
