import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { pusherServer } from "@/lib/pusher-server";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { channelName, isAudioOnly, token, fromName } = await req.json();

  try {
    if (process.env.PUSHER_APP_ID && process.env.NEXT_PUBLIC_PUSHER_KEY) {
      await pusherServer.trigger(`chat-${id}`, "call-invite", {
        senderId: userId,
        channelName,
        isAudioOnly,
        token,
        fromName: fromName || "User"
      });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Call invite error:", error);
    return NextResponse.json({ error: "Failed to send call invite" }, { status: 500 });
  }
}
