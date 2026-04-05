import { listingService } from "@/server/services/listing.service";
import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import ListingDetailsClient from "@/components/listing-details-client";

export default async function ListingDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { userId } = await auth();
  const listing = await listingService.getById(id, userId);
  if (!listing) notFound();

  const isOwner = userId === listing.userId;

  return <ListingDetailsClient listing={listing} isOwner={isOwner} />;
}
