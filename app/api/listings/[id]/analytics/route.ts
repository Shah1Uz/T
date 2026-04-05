import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const views = await (prisma.view as any).groupBy({
      by: ["visitorRegion"],
      where: {
        listingId: id,
        NOT: { visitorRegion: "Unknown" }
      },
      _count: {
        _all: true
      },
      orderBy: {
        _count: {
          visitorRegion: "desc"
        }
      }
    });

    const formattedData = views.map((v: any) => ({
      region: v.visitorRegion,
      count: v._count._all || v._count
    }));

    return NextResponse.json(formattedData);
  } catch (error) {
    console.error("Analytics fetch error:", error);
    return NextResponse.json([]);
  }
}
