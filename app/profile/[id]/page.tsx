import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import ProfileView from "@/components/profile-view";

export default async function SellerProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      listings: {
        include: {
          location: true,
          images: true,
          favorites: true,
        },
        orderBy: { createdAt: 'desc' }
      },
      reviewsReceived: {
        include: {
          reviewer: true
        },
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!user) notFound();

  // Sort listings simply to ensure they are valid for the client component
  const listings = user.listings || [];

  return <ProfileView user={user} listings={listings} />;
}
