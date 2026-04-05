import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/prisma";

/**
 * Uzum Pay Webhook Handler
 */

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      serviceId,
      transId,
      orderId, // This is our Transaction ID
      amount,
      status, // 0 - Created, 1 - Blocked, 2 - Captured, 3 - Reversed, 4 - Refunded
      sign,
    } = body;

    const SECRET_KEY = process.env.UZUM_SECRET_KEY || "";

    // Uzum signature usually follows a specific string pattern
    // For example: sha256(serviceId + transId + orderId + amount + status + secretKey)
    const signString = `${serviceId}${transId}${orderId}${amount}${status}${SECRET_KEY}`;
    const mySign = crypto.createHash("sha256").update(signString).digest("hex");

    if (mySign !== sign) {
      return NextResponse.json({
        error: "SIGN_FAILED",
        status: "REJECTED",
      }, { status: 400 });
    }

    // Find the transaction
    const transaction = await prisma.transaction.findUnique({
      where: { id: orderId },
    });

    if (!transaction) {
      return NextResponse.json({
        error: "TRANSACTION_NOT_FOUND",
        status: "REJECTED",
      }, { status: 404 });
    }

    // Uzum статус "Captured" (2) means success
    if (status === 2) {
      if (transaction.status === "COMPLETED") {
        return NextResponse.json({ status: "OK" });
      }

      // Update transaction
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          status: "COMPLETED",
          providerTransId: transId.toString(),
        },
      });

      // Update user plan
      const planExpiresAt = new Date();
      planExpiresAt.setDate(planExpiresAt.getDate() + 30);
      let planPriority = 0;
      if (transaction.plan === "VIP") planPriority = 3;
      else if (transaction.plan === "STANDART") planPriority = 2;
      else if (transaction.plan === "EKONOM") planPriority = 1;

      await prisma.user.update({
        where: { id: transaction.userId },
        data: {
          plan: transaction.plan,
          planExpiresAt: planExpiresAt,
          planPriority: planPriority,
          isVerified: true,
        },
      });
    }

    return NextResponse.json({ status: "OK" });
  } catch (err: any) {
    console.error("Uzum Webhook Error:", err);
    return NextResponse.json({
      error: "INTERNAL_ERROR",
      status: "REJECTED",
    }, { status: 500 });
  }
}
