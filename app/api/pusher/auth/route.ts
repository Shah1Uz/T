import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { pusherServer } from "@/lib/pusher-server";

export async function POST(req: Request) {
  const { userId } = await auth();
  const user = await currentUser();

  if (!userId || !user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const body = await req.formData();
  const socketId = body.get("socket_id") as string;
  const channel = body.get("channel_name") as string;

  const presenceData = {
    user_id: userId,
    user_info: {
      name: user.firstName || user.username || "Foydalanuvchi",
      image: user.imageUrl,
    },
  };

  const authResponse = pusherServer.authorizeChannel(socketId, channel, presenceData);

  return NextResponse.json(authResponse);
}
