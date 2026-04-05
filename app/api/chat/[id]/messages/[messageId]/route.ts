import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher-server";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string; messageId: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, messageId } = await params;

  try {
    // Check if message exists and belongs to the user
    const message = await prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    if (message.senderId !== userId) {
      return NextResponse.json({ error: "Forbidden: You can only delete your own messages" }, { status: 403 });
    }

    // Delete message
    await prisma.message.delete({
      where: { id: messageId },
    });

    // Notify via Pusher
    try {
      if (process.env.PUSHER_APP_ID && process.env.NEXT_PUBLIC_PUSHER_KEY) {
        await pusherServer.trigger(`chat-${id}`, "delete-message", { messageId });
      }
    } catch (e) {
      console.log("Pusher delete trigger skipped.", e);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Message delete error:", error);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
