import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
 
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ plan: "FREE" });
 
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { plan: true, planExpiresAt: true, trialUsed: true },
    });

    if (user?.plan && user.plan !== "FREE" && user.planExpiresAt && user.planExpiresAt < new Date()) {
      // Plan expired! Reset to FREE
      await prisma.user.update({
        where: { id: userId },
        data: {
          plan: "FREE",
          planPriority: 0,
          planExpiresAt: null,
        }
      });
      return NextResponse.json({ plan: "FREE", trialUsed: user.trialUsed });
    }

    return NextResponse.json({ 
      plan: user?.plan || "FREE",
      planExpiresAt: user?.planExpiresAt || null,
      trialUsed: user?.trialUsed || false
    });
  } catch (error) {
    return NextResponse.json({ plan: "FREE" }, { status: 500 });
  }
}
