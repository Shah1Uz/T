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
  
  try {
    if (pusherServer) {
      await pusherServer.trigger(`presence-chat-${id}`, "typing", {
        userId,
      });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Typing event error:", error);
    return NextResponse.json({ error: "Failed to trigger typing" }, { status: 500 });
  }
}
