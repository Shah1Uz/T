import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
 
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ plan: "FREE" });
 
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { plan: true, planExpiresAt: true, trialUsed: true, referralCode: true, referralCount: true },
    });

    return NextResponse.json({ 
      plan: user?.plan || "FREE",
      planExpiresAt: user?.planExpiresAt || null,
      trialUsed: user?.trialUsed || false,
      referralCode: user?.referralCode || null,
      referralCount: user?.referralCount || 0
    });
  } catch (error) {
    return NextResponse.json({ plan: "FREE" }, { status: 500 });
  }
}
