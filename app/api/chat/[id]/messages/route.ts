import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher-server";
import { uploadFile } from "@/lib/upload";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const formData = await req.formData();
  
  const text = formData.get("text") as string | null;
  const audioFile = formData.get("audio") as File | null;
  const audioDuration = formData.get("audioDuration") ? parseInt(formData.get("audioDuration") as string) : null;
  const imageFile = formData.get("image") as File | null;
  const videoFile = formData.get("video") as File | null;

  try {
    console.log("Processing message send (direct):", { text, hasAudio: !!audioFile, audioDuration, hasImage: !!imageFile, hasVideo: !!videoFile });

    let audioUrl: string | null = null;
    let imageUrl: string | null = null;
    let videoUrl: string | null = null;

    // Upload audio if provided
    if (audioFile) {
      console.log("Uploading audio...");
      audioUrl = await uploadFile(audioFile);
      console.log("Audio uploaded:", audioUrl);
    }

    // Upload image if provided
    if (imageFile) {
      console.log("Uploading image...");
      imageUrl = await uploadFile(imageFile);
      console.log("Image uploaded:", imageUrl);
    }

    // Upload video if provided
    if (videoFile) {
      console.log("Uploading video...");
      videoUrl = await uploadFile(videoFile);
      console.log("Video uploaded:", videoUrl);
    }

    console.log("Creating database message entry...");
    const message = await (prisma.message as any).create({
      data: {
        chatId: id,
        senderId: userId,
        text: text || (audioUrl ? "[Voice message]" : imageUrl ? "[Image]" : videoUrl ? "[Video]" : ""),
        audioUrl,
        audioDuration,
        imageUrl,
        videoUrl,
      },
    });
    console.log("Message created in DB:", message.id);

    // Fetch participants to notify their sidebars
    const participants = await prisma.chatParticipant.findMany({
      where: { chatId: id },
      select: { userId: true }
    });

    try {
      if (process.env.PUSHER_APP_ID && process.env.NEXT_PUBLIC_PUSHER_KEY) {
        // Update the current chat window
        await pusherServer.trigger(`chat-${id}`, "new-message", message);
        
        // Update the sidebar/notifications for all participants
        for (const p of participants) {
          await pusherServer.trigger(`user-${p.userId}`, "chat-update", {
            chatId: id,
            message,
            type: "new-message"
          });
        }
      }
    } catch (e) {
      console.log("Pusher trigger skipped/failed. Real-time sync may not work.", e);
    }

    return NextResponse.json(message);
  } catch (error) {
    console.error("Message send error:", error);
    return NextResponse.json({ error: "Failed to send" }, { status: 500 });
  }
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const messages = await prisma.message.findMany({
    where: { chatId: id },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(messages);
}
