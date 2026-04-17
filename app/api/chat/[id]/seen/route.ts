import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { chatService } from "@/server/services/chat.service";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  try {
    await chatService.markAsSeen(id, userId);
    
    // Notify the user's own sidebar to clear the unread count
    if (process.env.PUSHER_APP_ID && process.env.NEXT_PUBLIC_PUSHER_KEY) {
      const { pusherServer } = await import("@/lib/pusher-server");
      await pusherServer.trigger(`user-${userId}`, "chat-update", {
        chatId: id,
        type: "messages-seen"
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Mark as seen error:", error);
    return NextResponse.json({ error: "Failed to mark as seen" }, { status: 500 });
  }
}
