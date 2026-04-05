import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import EditListingClient from "@/components/edit-listing-client";

export default async function EditListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const listing = await prisma.listing.findUnique({
    where: { id },
    include: {
      images: true,
      location: true,
    },
  });

  if (!listing) {
    redirect("/dashboard");
  }

  // Ensure only the owner (or admin) can edit
  if (listing.userId !== user.id && user.emailAddresses[0]?.emailAddress !== "shahuztech@gmail.com") {
    redirect("/dashboard");
  }

  return <EditListingClient listing={listing} />;
}
