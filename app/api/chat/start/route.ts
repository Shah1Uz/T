import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  const { userId: buyerId } = await auth();
  if (!buyerId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { listingId } = body;

    if (!listingId) {
      return NextResponse.json({ error: "Missing listingId" }, { status: 400 });
    }

    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
    });

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    if (listing.userId === buyerId) {
      return NextResponse.json({ error: "Cannot start chat with your own listing" }, { status: 400 });
    }

    // Check if chat already exists for this buyer-seller-listing combination
    const existingChat = await prisma.chat.findFirst({
      where: {
        listingId,
        participants: {
          every: {
            userId: {
              in: [buyerId, listing.userId],
            },
          },
        },
      },
    });

    if (existingChat) {
      return NextResponse.json(existingChat);
    }

    // Create new chat
    const chat = await prisma.chat.create({
      data: {
        listingId,
        participants: {
          create: [
            { userId: buyerId },
            { userId: listing.userId },
          ],
        },
      },
    });

    return NextResponse.json(chat);
  } catch (error) {
    console.error("Error starting chat:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
