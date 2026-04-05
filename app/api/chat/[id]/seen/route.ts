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
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Mark as seen error:", error);
    return NextResponse.json({ error: "Failed to mark as seen" }, { status: 500 });
  }
}
