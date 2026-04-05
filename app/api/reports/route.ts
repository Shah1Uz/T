import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    const { listingId, type, message } = await req.json();

    if (!listingId || !type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const report = await prisma.listingReport.create({
      data: {
        listingId,
        reporterId: userId || null,
        type,
        message,
      },
    });

    return NextResponse.json(report);
  } catch (error) {
    console.error("[REPORTS_POST]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
