import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import FavoritesClient from "./favorites-client";

export default async function FavoritesPage() {
  const { userId } = await auth();
  
  if (!userId) {
    return <FavoritesClient listings={[]} userId={null} />;
  }

  const favorites = await prisma.favorite.findMany({
    where: { userId },
    include: {
      listing: {
        include: { images: true, location: true }
      }
    },
    orderBy: { createdAt: "desc" } as any,
  });

  const listings = (favorites as any[]).map(f => f.listing);

  return <FavoritesClient listings={listings} userId={userId} />;
}
