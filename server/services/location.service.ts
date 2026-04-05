import prisma from "@/lib/prisma";

export const locationService = {
  async getRegions() {
    return prisma.location.findMany({
      where: { type: "region" },
      orderBy: { name: "asc" },
    });
  },

  async getDistricts(regionId: string) {
    return prisma.location.findMany({
      where: { parentId: regionId, type: "district" },
      orderBy: { name: "asc" },
    });
  },

  async getAllLocations() {
    return prisma.location.findMany({
      include: { children: true },
      where: { parentId: null },
    });
  }
};
