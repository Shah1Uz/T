import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function POST() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 1. Find the admin user (skip current user to avoid self-chat errors)
    let admin = await prisma.user.findFirst({
      where: {
        role: "ADMIN",
        id: { not: userId }
      }
    });

    // If no other admin found, and current user IS admin, they shouldn't chat with support
    if (!admin) {
      const currentUserData = await prisma.user.findUnique({ where: { id: userId } });
      if (currentUserData?.role === "ADMIN") {
        return NextResponse.json({ error: "Siz admin ekansiz. Support chatini ishlatishingiz shart emas." }, { status: 400 });
      }

      // If no admin at all in DB, pick the oldest user as fallback or return error
      admin = await prisma.user.findFirst({
        where: { role: "ADMIN" }
      });
    }

    if (!admin || admin.id === userId) {
      return NextResponse.json({ error: "Support admin topilmadi" }, { status: 404 });
    }

    // 2. Check if a support chat already exists for this user
    const existingChat = await prisma.chat.findFirst({
      where: {
        isSupport: true,
        participants: {
          some: { userId }
        }
      } as any,
      include: {
        participants: {
          include: { user: true }
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1
        }
      }
    });

    if (existingChat) {
      return NextResponse.json(existingChat);
    }

    // 3. Create new support chat
    const chat = await prisma.chat.create({
      data: {
        isSupport: true,
        participants: {
          create: [
            { userId: userId },
            { userId: admin.id },
          ],
        },
      } as any,
      include: {
        participants: {
          include: { user: true }
        },
        messages: true
      }
    });

    return NextResponse.json(chat);
  } catch (error) {
    console.error("Error starting support chat:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
