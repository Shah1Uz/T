import prisma from "@/lib/prisma";

export const adminService = {
  async getDashboardStats() {
    const [totalUsers, totalListings, totalViews, totalComments] = await Promise.all([
      prisma.user.count(),
      prisma.listing.count(),
      prisma.view.count(),
      prisma.comment.count(),
    ]);

    return {
      totalUsers,
      totalListings,
      totalViews,
      totalComments
    };
  },

  async getAllUsers(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        include: {
          _count: {
            select: { listings: true, comments: true }
          }
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.user.count()
    ]);

    return {
      users,
      total,
      pages: Math.ceil(total / limit)
    };
  },

  async getAllListings(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    
    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        include: { 
          user: true, 
          images: true,
          _count: { select: { views: true, favorites: true } } 
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.listing.count()
    ]);

    return {
      listings,
      total,
      pages: Math.ceil(total / limit)
    };
  },

  async toggleUserVerification(id: string, isVerified: boolean) {
    return prisma.user.update({
      where: { id },
      data: { isVerified }
    });
  },
  
  async toggleUserBlock(id: string, isBlocked: boolean) {
    return prisma.user.update({
      where: { id },
      data: { isBlocked }
    });
  },

  async changeUserPlan(id: string, newPlan: string, daysToAdd: number = 30) {
    const expiresAt = newPlan === "FREE" ? null : new Date(Date.now() + daysToAdd * 24 * 60 * 60 * 1000);
    let planPriority = 0;
    if (newPlan === "VIP") planPriority = 3;
    else if (newPlan === "STANDART") planPriority = 2;
    else if (newPlan === "EKONOM") planPriority = 1;
    
    return prisma.user.update({
      where: { id },
      data: { 
        plan: newPlan,
        planExpiresAt: expiresAt,
        planPriority
      }
    });
  },

  async cleanupExpiredPlans() {
    const now = new Date();
    
    // Find all users with expired plans
    const expiredUsers = await prisma.user.findMany({
      where: {
        plan: { not: "FREE" },
        planExpiresAt: { lt: now },
      },
      select: { id: true }
    });

    if (expiredUsers.length === 0) return 0;

    // Reset them to FREE
    const result = await prisma.user.updateMany({
      where: {
        id: { in: expiredUsers.map(u => u.id) }
      },
      data: {
        plan: "FREE",
        planPriority: 0,
        planExpiresAt: null
      }
    });

    console.log(`Cleaned up ${result.count} expired plans.`);
    return result.count;
  }
};
