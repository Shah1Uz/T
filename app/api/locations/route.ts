import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const locations = await prisma.location.findMany({
      include: {
        children: true,
      },
      where: {
        parentId: null, // Only fetch top-level regions
      },
    });

    return NextResponse.json(locations);
  } catch (error) {
    console.error("Error fetching locations:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
