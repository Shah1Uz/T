import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const listings = await prisma.listing.findMany({
      select: {
        id: true,
        title: true,
        price: true,
        type: true,
        propertyType: true,
        latitude: true,
        longitude: true,
        rooms: true,
        area: true,
        images: {
          take: 1,
          select: { url: true }
        }
      }
    });

    return NextResponse.json(listings);
  } catch (error) {
    console.error("Map listing fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch map data" }, { status: 500 });
  }
}
