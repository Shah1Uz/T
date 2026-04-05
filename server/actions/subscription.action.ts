"use server";
 
import prisma from "@/lib/prisma";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
 
export async function createPaymentAction(plan: string, provider: "CLICK" | "UZUM") {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    const prices: { [key: string]: number } = {
      EKONOM: 29000,
      STANDART: 59000,
      VIP: 70000,
    };

    const amount = prices[plan];
    if (!amount) return { success: false, error: "Invalid plan" };

    // Create a pending transaction
    const transaction = await prisma.transaction.create({
      data: {
        userId,
        amount,
        plan,
        provider,
        status: "PENDING",
      },
    });

    let paymentUrl = "";

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

    if (provider === "CLICK") {
      const serviceId = process.env.CLICK_SERVICE_ID || "";
      const merchantId = process.env.CLICK_MERCHANT_ID || "";
      paymentUrl = `https://my.click.uz/services/pay?service_id=${serviceId}&merchant_id=${merchantId}&amount=${amount}&transaction_param=${transaction.id}&return_url=${encodeURIComponent(baseUrl)}/pricing`;
    } else if (provider === "UZUM") {
      const merchantId = process.env.UZUM_MERCHANT_ID || "";
      // Uzum Pay usually requires an API call to get a session, but for now we'll use a placeholder or common redirect
      paymentUrl = `https://checkout.uzum.uz/pay?merchantId=${merchantId}&amount=${amount * 100}&orderId=${transaction.id}&returnUrl=${encodeURIComponent(baseUrl)}/pricing`;
    }

    return { success: true, paymentUrl };
  } catch (error: any) {
    console.error("Payment creation error:", error);
    return { success: false, error: error.message };
  }
}

export async function activateFreeTrialAction(plan: string) {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Tizimga kiring" };

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return { success: false, error: "Foydalanuvchi topilmadi" };

    if (user.trialUsed) {
      return { success: false, error: "Siz bepul trial imkoniyatidan foydalanib bo'lgansiz" };
    }

    const priorityMap: { [key: string]: number } = {
       VIP: 3,
       STANDART: 2,
       EKONOM: 1,
       FREE: 0
    };

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 3); // 3-day trial

    await prisma.user.update({
      where: { id: userId },
      data: {
        plan,
        planExpiresAt: expiresAt,
        planPriority: priorityMap[plan] || 0,
        trialUsed: true
      }
    });

    // Sync with Clerk metadata
    const client = await clerkClient();
    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        plan,
        planPriority: priorityMap[plan] || 0
      }
    });

    revalidatePath("/pricing");
    revalidatePath("/admin");
    
    return { success: true };
  } catch (error: any) {
    console.error("Trial activation error:", error);
    return { success: false, error: error.message };
  }
}
