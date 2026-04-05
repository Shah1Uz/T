import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function GET() {
  let user;
  try {
    user = await currentUser();
  } catch (error) {
    console.error("Clerk currentUser error in GET /api/notifications:", error);
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 });
  }

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 20
    });

    return NextResponse.json(notifications);
  } catch (error) {
    return NextResponse.json([]);
  }
}

export async function PATCH(req: Request) {
  let user;
  try {
    user = await currentUser();
  } catch (error) {
    console.error("Clerk currentUser error in PATCH /api/notifications:", error);
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 });
  }

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await req.json();
    await prisma.notification.update({
      where: { id, userId: user.id },
      data: { isRead: true }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}
