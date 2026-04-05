import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { listingService } from "@/server/services/listing.service";
import prisma from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const listing = await listingService.getById(id);
    if (!listing) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(listing);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch listing" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  let user;
  try {
    user = await currentUser();
  } catch (error) {
    console.error("Clerk currentUser error in PATCH /api/listings/[id]:", error);
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 });
  }

  if (!user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { images, ...data } = body;

    // Get old listing to check for price drop
    const oldListing = await prisma.listing.findUnique({
      where: { id, userId: user.id },
      select: { price: true, title: true }
    });

    if (!oldListing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Update listing
    const updatedListing = await prisma.listing.update({
      where: { id, userId: user.id },
      data: {
        ...data,
        images: {
          deleteMany: {},
          create: images.map((url: string) => ({ url })),
        },
      },
    });

    // Check for price drop
    if (data.price < oldListing.price) {
      // Find users who favorited this
      const followers = await prisma.favorite.findMany({
        where: { listingId: id },
        select: { userId: true }
      });

      // Create notifications for each follower
      if (followers.length > 0) {
        await (prisma as any).notification.createMany({
          data: followers.map(f => ({
            userId: f.userId,
            type: "price_drop",
            title: "Narx tushdi! 📉",
            message: `"${oldListing.title}" e'lonining narxi ${(oldListing.price).toLocaleString()} USD dan ${(data.price).toLocaleString()} USD ga tushdi.`,
            listingId: id,
          }))
        });
      }
    }

    return NextResponse.json(updatedListing);
  } catch (error) {
    console.error("Update listing error:", error);
    return NextResponse.json({ error: "Failed to update listing" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  let user;
  try {
    user = await currentUser();
  } catch (error) {
    console.error("Clerk currentUser error in DELETE /api/listings/[id]:", error);
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 });
  }

  if (!user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const isAdmin = user.emailAddresses[0]?.emailAddress === "shahuztech@gmail.com";

  try {
    if (isAdmin) {
      await prisma.listing.delete({ where: { id } });
    } else {
      await listingService.delete(id, user.id);
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete listing" }, { status: 500 });
  }
}
