import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher-server";

// POST: Record a view for a listing (real-time counter + geo-tracking)
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    // Get visitor IP (handling proxy)
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
    
    let visitorRegion = "Unknown";
    let visitorCity = "Unknown";

    // Only fetch for non-local IPs
    if (ip !== "127.0.0.1" && ip !== "::1") {
      try {
        const geoRes = await fetch(`http://ip-api.com/json/${ip}?fields=regionName,city`);
        if (geoRes.ok) {
          const geoData = await geoRes.json();
          visitorRegion = geoData.regionName || "Unknown";
          visitorCity = geoData.city || "Unknown";
        }
      } catch (e) {
        console.error("GeoIP error:", e);
      }
    }

    const count = await prisma.view.count({ where: { listingId: id } });
    await (prisma.view as any).create({ 
      data: { 
        listingId: id,
        visitorRegion,
        visitorCity
      } 
    });
    
    // Broadcast updated count via Pusher
    await pusherServer.trigger(`listing-${id}`, "view-update", { count: count + 1 });
    
    return NextResponse.json({ count: count + 1 });
  } catch (error) {
    console.error("View record error:", error);
    return NextResponse.json({ count: 0 });
  }
}

// GET: Get current view count
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const count = await prisma.view.count({ where: { listingId: id } });
  return NextResponse.json({ count });
}
