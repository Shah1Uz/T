import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 1 });

  try {
    const { name, filters, polygon } = await req.json();

    const savedSearch = await prisma.savedSearch.create({
      data: {
        userId,
        name,
        filters,
        polygon,
      },
    });

    return NextResponse.json(savedSearch);
  } catch (error) {
    console.error("Save search error:", error);
    return NextResponse.json({ error: "Failed to save search" }, { status: 500 });
  }
}

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const savedSearches = await prisma.savedSearch.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(savedSearches);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch saved searches" }, { status: 500 });
  }
}
