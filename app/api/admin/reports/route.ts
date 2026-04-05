import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

const ADMIN_EMAIL = "shahuztech@gmail.com";

export async function GET() {
  try {
    const user = await currentUser();
    
    if (!user || user.emailAddresses[0]?.emailAddress !== ADMIN_EMAIL) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const reports = await prisma.listingReport.findMany({
      include: {
        listing: {
          include: {
            images: { take: 1 },
            user: true,
          },
        },
        reporter: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(reports);
  } catch (error) {
    console.error("[ADMIN_REPORTS_GET]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await currentUser();
    
    if (!user || user.emailAddresses[0]?.emailAddress !== ADMIN_EMAIL) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Report ID required" }, { status: 400 });
    }

    await prisma.listingReport.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[ADMIN_REPORTS_DELETE]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
