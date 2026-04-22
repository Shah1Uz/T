import { MetadataRoute } from 'next';
import prisma from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Use production URL if the environment variable is not set correctly or points to localhost
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL && !process.env.NEXT_PUBLIC_APP_URL.includes('localhost')
    ? process.env.NEXT_PUBLIC_APP_URL
    : 'https://uysell.uz';

  // Fetch all listing IDs and update times
  const listings = await prisma.listing.findMany({
    select: {
      id: true,
      updatedAt: true,
    },
  });

  // Fetch all news IDs and update times
  const news = await prisma.news.findMany({
    select: {
      id: true,
      updatedAt: true,
    },
  });

  const staticRoutes = [
    '',
    '/listings',
    '/map',
    '/news',
    '/top-sellers',
    '/pricing',
    '/about',
    '/privacy',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  const listingRoutes = listings.map((listing) => ({
    url: `${baseUrl}/listings/${listing.id}`,
    lastModified: listing.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  const newsRoutes = news.map((item) => ({
    url: `${baseUrl}/news/${item.id}`,
    lastModified: item.updatedAt,
    changeFrequency: 'monthly' as const,
    priority: 0.5,
  }));

  return [...staticRoutes, ...listingRoutes, ...newsRoutes];
}
