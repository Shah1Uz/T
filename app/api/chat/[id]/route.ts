import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  const clerkUser = await currentUser();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const isAdmin = clerkUser?.primaryEmailAddress?.emailAddress === "shahuztech@gmail.com" || 
                  clerkUser?.emailAddresses.some(e => e.emailAddress === "shahuztech@gmail.com");

  try {
    const chat = await prisma.chat.findUnique({
      where: { id },
      include: {
        listing: {
          include: {
            images: { take: 1 }
          }
        },
        participants: {
          include: {
            user: true
          }
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1
        }
      }
    });

    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    // Check if user is a participant or an admin
    const isParticipant = chat.participants.some(p => p.userId === userId);
    if (!isParticipant && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(chat);
  } catch (error) {
    console.error("Error fetching chat:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
