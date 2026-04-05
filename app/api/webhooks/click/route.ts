import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/prisma";

/**
 * Click.uz Webhook Handler
 * Documentation: http://docs.click.uz/
 */

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const click_trans_id = formData.get("click_trans_id")?.toString();
    const service_id = formData.get("service_id")?.toString();
    const click_paydoc_id = formData.get("click_paydoc_id")?.toString();
    const merchant_trans_id = formData.get("merchant_trans_id")?.toString(); // This is our Transaction ID
    const amount = formData.get("amount")?.toString();
    const action = formData.get("action")?.toString(); // 0 for Prepare, 1 for Complete
    const error = formData.get("error")?.toString();
    const error_note = formData.get("error_note")?.toString();
    const sign_time = formData.get("sign_time")?.toString();
    const sign_string = formData.get("sign_string")?.toString();

    const SECRET_KEY = process.env.CLICK_SECRET_KEY || "";

    // Calculate signature: md5(click_trans_id + service_id + secret_key + merchant_trans_id + amount + action + sign_time)
    const my_sign_string = crypto
      .createHash("md5")
      .update(
        `${click_trans_id}${service_id}${SECRET_KEY}${merchant_trans_id}${amount}${action}${sign_time}`
      )
      .digest("hex");

    if (my_sign_string !== sign_string) {
      return NextResponse.json({
        error: "-1",
        error_note: "SIGN CHECK FAILED",
      });
    }

    if (error && parseInt(error) < 0) {
      return NextResponse.json({
        error: "-9",
        error_note: "TRANSACTION FAILED",
      });
    }

    // Find the transaction in our database
    const transaction = await prisma.transaction.findUnique({
      where: { id: merchant_trans_id },
      include: { user: true },
    });

    if (!transaction) {
      return NextResponse.json({
        error: "-5",
        error_note: "TRANSACTION NOT FOUND",
      });
    }

    if (parseFloat(amount || "0") !== transaction.amount) {
      return NextResponse.json({
        error: "-2",
        error_note: "INCORRECT AMOUNT",
      });
    }

    if (transaction.status === "COMPLETED") {
      return NextResponse.json({
        error: "-4",
        error_note: "TRANSACTION ALREADY COMPLETED",
      });
    }

    // Action 0: Prepare
    if (action === "0") {
      return NextResponse.json({
        click_trans_id,
        merchant_trans_id,
        merchant_prepare_id: transaction.id,
        error: "0",
        error_note: "Success",
      });
    }

    // Action 1: Complete
    if (action === "1") {
      // Update transaction status
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          status: "COMPLETED",
          providerTransId: click_trans_id,
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

      return NextResponse.json({
        click_trans_id,
        merchant_trans_id,
        merchant_confirm_id: transaction.id,
        error: "0",
        error_note: "Success",
      });
    }

    return NextResponse.json({
      error: "-3",
      error_note: "ACTION NOT FOUND",
    });
  } catch (err: any) {
    console.error("Click Webhook Error:", err);
    return NextResponse.json({
      error: "-8",
      error_note: "INTERNAL SERVER ERROR",
    });
  }
}
