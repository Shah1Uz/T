import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher-server";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string; messageId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const { id: chatId, messageId } = await params;
    const { emoji } = await req.json();

    if (!emoji) return new NextResponse("Emoji is required", { status: 400 });

    // Check if reaction already exists
    const existingReaction = await prisma.messageReaction.findUnique({
      where: {
        messageId_userId_emoji: {
          messageId,
          userId,
          emoji,
        },
      },
    });

    if (existingReaction) {
      // Remove reaction if it exists (toggle)
      await prisma.messageReaction.delete({
        where: { id: existingReaction.id },
      });
      
      await pusherServer.trigger(`chat-${chatId}`, "message-reaction", {
        messageId,
        userId,
        emoji,
        action: "removed",
      });
    } else {
      // Add new reaction
      const newReaction = await prisma.messageReaction.create({
        data: {
          emoji,
          messageId,
          userId,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      await pusherServer.trigger(`chat-${chatId}`, "message-reaction", {
        messageId,
        reaction: newReaction,
        action: "added",
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[REACTION_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
