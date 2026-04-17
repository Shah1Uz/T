import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const chats = await prisma.chat.findMany({
      where: {
        participants: {
          some: {
            userId,
          },
        },
      },
      include: {
        listing: {
          include: {
            images: {
              take: 1,
            },
          },
        },
        participants: {
          include: {
            user: true,
          },
        },
        messages: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
        _count: {
          select: {
            messages: {
              where: {
                seen: false,
                senderId: { not: userId }
              }
            }
          }
        }
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    const chatsWithUnreadCount = chats.map((chat: any) => ({
      ...chat,
      unreadCount: chat._count.messages
    }));

    return NextResponse.json(chatsWithUnreadCount);
  } catch (error) {
    console.error("Error fetching chats:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
