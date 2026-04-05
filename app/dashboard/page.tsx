import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import DashboardClient from "./dashboard-client";

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/");

  // Fetch user data including plan
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { plan: true, name: true }
  });

  // Fetch user's listings with their views
  const listings = await prisma.listing.findMany({
    where: { userId },
    include: { images: true, location: true, views: true },
    orderBy: { createdAt: "desc" },
  });

  // Calculate stats purely from listings data (no extra queries that might fail)
  const totalViews = listings.reduce((sum, l) => sum + (l.views?.length ?? 0), 0);
  const salesListings = listings.filter((l) => l.type === "sale").length;

  const stats = {
    listings: listings.length,
    views: totalViews,
    calls: listings.filter((l) => !!l.phone).length,
    sales: salesListings,
  };

  return <DashboardClient listings={listings} stats={stats} user={user} />;
}
