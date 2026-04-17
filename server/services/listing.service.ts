import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { pusherServer } from "@/lib/pusher-server";
import { adminService } from "./admin.service";

let lastCleanupTime = 0;
const CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minutes

export const listingService = {
  async create(data: Prisma.ListingUncheckedCreateInput, imageUrls: string[]) {
    const listing = await prisma.listing.create({
      data: {
        ...data,
        images: {
          create: imageUrls
            .filter(url => typeof url === 'string' && url.trim() !== '')
            .map(url => ({ url }))
        }
      }
    });

    // Notify users with matching saved searches
    this.notifyMatchingUsers(listing).catch(err => console.error("Notification error:", err));

    return listing;
  },

  async notifyMatchingUsers(listing: any) {
    // 1. Efficiently find matching saved searches using Database filtering
    const matchingSearches = await prisma.savedSearch.findMany({
      where: {
        userId: { not: listing.userId },
        AND: [
          {
            OR: [
              { filters: { path: ["type"], equals: listing.type } },
              { filters: { path: ["type"], equals: null } },
              { filters: { path: ["type"], equals: undefined } },
            ]
          },
          {
            OR: [
              { filters: { path: ["rooms"], equals: listing.rooms } },
              { filters: { path: ["rooms"], equals: null } },
            ]
          },
          // Price range filtering (if stored as numbers in the Json filters)
          // Note: Advanced JSON filtering varies by DB. For maximum compatibility and scale, 
          // we fetch potentially matching ones and do a final quick check.
        ]
      }
    });

    for (const search of matchingSearches) {
      const filters = (search.filters as any) || {};
      const polygon = (search.polygon as any);

      // Final precise check for price and polygon (which are harder to do in raw JSON queries across all DBs)
      let match = true;
      if (filters.minPrice && listing.price < Number(filters.minPrice)) match = false;
      if (filters.maxPrice && listing.price > Number(filters.maxPrice)) match = false;

      if (match && polygon && Array.isArray(polygon)) {
        if (!this.isPointInPolygon([listing.latitude, listing.longitude], polygon)) {
          match = false;
        }
      }

      if (match) {
        const notification = await prisma.notification.create({
          data: {
            userId: search.userId,
            type: "NEW_LISTING",
            title: "Yangi e'lon topildi!",
            message: `Qidiruvingizga mos yangi uy: ${listing.title}`,
            listingId: listing.id
          }
        });

        await pusherServer.trigger(`user-${search.userId}`, "notification", notification);
      }
    }
  },

  isPointInPolygon(point: number[], polygon: any[]) {
    const x = point[0], y = point[1];
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i].lat, yi = polygon[i].lng;
      const xj = polygon[j].lat, yj = polygon[j].lng;
      const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  },

  async getAll(filters: {
    locationId?: string;
    type?: string;
    propertyType?: string;
    minPrice?: number;
    maxPrice?: number;
    rooms?: number;
    searchQuery?: string;
  } = {}, page = 1, limit = 16) {
    const where: Prisma.ListingWhereInput = {};

    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      where.OR = [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { location: { name: { contains: query, mode: 'insensitive' } } },
        { type: { contains: query, mode: 'insensitive' } },
        { propertyType: { contains: query, mode: 'insensitive' } },
      ];
    }
    if (filters.locationId) where.locationId = filters.locationId;
    if (filters.type) where.type = filters.type;
    if (filters.propertyType) where.propertyType = filters.propertyType;
    if (filters.minPrice || filters.maxPrice) {
      where.price = {
        gte: filters.minPrice,
        lte: filters.maxPrice,
      };
    }
    if (filters.rooms) where.rooms = filters.rooms;

    // Filter out blocked users' listings
    where.user = { isBlocked: false };

    // Opportunistically cleanup expired plans (no more than once every 5 mins)
    const now = Date.now();
    if (now - lastCleanupTime > CLEANUP_INTERVAL) {
      lastCleanupTime = now;
      adminService.cleanupExpiredPlans().catch(err => console.error("Plan cleanup error:", err));
    }

    const listings = await prisma.listing.findMany({
      where,
      include: { 
        images: true, 
        location: true, 
        favorites: true, 
        user: { select: { plan: true, isVerified: true, name: true, imageUrl: true } },
        _count: { select: { views: true } }
      },
      orderBy: [
        { user: { planPriority: "desc" } },
        { ratingAverage: "desc" },
        { ratingCount: "desc" },
        { createdAt: "desc" }
      ],
      skip: (page - 1) * limit,
      take: limit,
    });

    const total = await prisma.listing.count({ where });

    return { listings, total, pages: Math.ceil(total / limit) };
  },

  async getById(id: string, userId?: string | null, ipAddress?: string | null) {
    if (userId) {
      prisma.view.upsert({
        where: { userId_listingId: { userId, listingId: id } },
        update: { viewedAt: new Date() },
        create: { listingId: id, userId }
      }).catch(e => console.error("View recording error:", e));
    } else if (ipAddress) {
      prisma.view.findFirst({
        where: { listingId: id, ipAddress, userId: null }
      }).then(existingView => {
        if (!existingView) {
          prisma.view.create({ data: { listingId: id, ipAddress } }).catch(e => console.error("View recording error:", e));
        }
      }).catch(e => console.error("View recording error:", e));
    }

    return prisma.listing.findFirst({
      where: { 
        id,
        user: { isBlocked: false }
      },
      include: {
        images: true,
        location: true,
        user: {
          include: {
            reviewsReceived: true
          }
        },
        views: true,
        favorites: true,
        comments: {
          include: { user: true },
          orderBy: { createdAt: "desc" }
        }
      }
    });

  },

  async delete(id: string, userId: string) {
    const listing = await prisma.listing.findUnique({ where: { id } });
    if (!listing || listing.userId !== userId) throw new Error("Unauthorized");
    
    return prisma.listing.delete({ where: { id } });
  }
};
