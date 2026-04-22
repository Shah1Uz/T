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

    // Logging for debugging
    const logData = Object.fromEntries(formData.entries());
    console.log("Click Webhook Received:", logData);

    const SECRET_KEY = process.env.CLICK_SECRET_KEY || "";

    // Calculate signature
    let hashString = `${click_trans_id}${service_id}${SECRET_KEY}${merchant_trans_id}`;
    if (action === "1") {
      const merchant_prepare_id = formData.get("merchant_prepare_id")?.toString();
      hashString += merchant_prepare_id || "";
    }
    hashString += `${amount}${action}${sign_time}`;

    const my_sign_string = crypto
      .createHash("md5")
      .update(hashString)
      .digest("hex");
    
    console.log("Calculated Signature:", my_sign_string);
    console.log("Received Signature:", sign_string);

    const commonResponse = {
      click_trans_id: parseInt(click_trans_id || "0"),
      merchant_trans_id,
    };

    if (my_sign_string !== sign_string) {
      console.error("Signature mismatch!");
      return NextResponse.json({
        ...commonResponse,
        error: -1,
        error_note: "SIGN CHECK FAILED",
      });
    }

    if (error && parseInt(error) < 0) {
      return NextResponse.json({
        ...commonResponse,
        error: -9,
        error_note: "TRANSACTION FAILED",
      });
    }

    // Find the transaction in our database
    const transaction = await prisma.transaction.findUnique({
      // @ts-ignore
      where: { id: parseInt(merchant_trans_id || "0") },
      include: { user: true },
    });

    if (!transaction) {
      return NextResponse.json({
        ...commonResponse,
        error: -5,
        error_note: "TRANSACTION NOT FOUND",
      });
    }

    // Amount check (allowing for minor string formatting differences)
    if (Math.abs(parseFloat(amount || "0") - transaction.amount) > 0.01) {
      return NextResponse.json({
        ...commonResponse,
        error: -2,
        error_note: "INCORRECT AMOUNT",
      });
    }

    if (transaction.status === "COMPLETED") {
      return NextResponse.json({
        ...commonResponse,
        error: -4,
        error_note: "TRANSACTION ALREADY COMPLETED",
      });
    }

    // Action 0: Prepare
    if (action === "0") {
      return NextResponse.json({
        ...commonResponse,
        merchant_prepare_id: transaction.id.toString(),
        error: 0,
        error_note: "Success",
      });
    }

    // Action 1: Complete
    if (action === "1") {
      try {
        // Update transaction status
        await prisma.transaction.update({
          // @ts-ignore
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
        else if (transaction.plan === "TEST") planPriority = 1;

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
          ...commonResponse,
          merchant_confirm_id: transaction.id.toString(),
          error: 0,
          error_note: "Success",
        });
      } catch (dbErr) {
        console.error("DB Update Error:", dbErr);
        return NextResponse.json({
          ...commonResponse,
          error: -8,
          error_note: "INTERNAL SERVER ERROR",
        });
      }
    }

    return NextResponse.json({
      ...commonResponse,
      error: -3,
      error_note: "ACTION NOT FOUND",
    });
  } catch (err: any) {
    console.error("Click Webhook Error:", err);
    return NextResponse.json({
      error: -8,
      error_note: "INTERNAL SERVER ERROR",
    });
  }
}
