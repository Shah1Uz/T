import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { RtcTokenBuilder, RtcRole } from "agora-token";

const APP_ID = process.env.NEXT_PUBLIC_AGORA_APP_ID!;
const APP_CERTIFICATE = process.env.AGORA_APP_CERTIFICATE!;

export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const channelName = searchParams.get("channelName");

  if (!channelName) {
    return NextResponse.json({ error: "channelName is required" }, { status: 400 });
  }

  const role = RtcRole.PUBLISHER;
  const expirationTimeInSeconds = 3600; // 1 hour
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

  try {
    const token = RtcTokenBuilder.buildTokenWithUid(
      APP_ID,
      APP_CERTIFICATE,
      channelName,
      0, // uid 0 lets Agora assign a uid or use the string account
      role,
      privilegeExpiredTs,
      privilegeExpiredTs
    );

    return NextResponse.json({ token, uid: 0 });
  } catch (error) {
    console.error("Agora Token Error:", error);
    return NextResponse.json({ error: "Failed to generate token" }, { status: 500 });
  }
}
