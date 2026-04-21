import { auth, currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";

export async function syncUser() {
  const { userId } = await auth();
  const user = await currentUser();

  if (!userId || !user) return null;

  const cookieStore = await cookies();
  const referralCodeFromCookie = cookieStore.get("referral_code")?.value;

  const name = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Foydalanuvchi';

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (existingUser) {
    // Just update name and imageUrl if they changed
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        imageUrl: user.imageUrl,
        // Ensure they have a referral code if they don't yet
        referralCode: existingUser.referralCode || `UY-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      },
    });
    return updatedUser;
  }

  // New user creation logic
  let referrerId = null;
  if (referralCodeFromCookie) {
    const referrer = await prisma.user.findUnique({
      where: { referralCode: referralCodeFromCookie },
    });
    if (referrer) {
      referrerId = referrer.id;
      
      // Increment referrer's count
      await prisma.user.update({
        where: { id: referrer.id },
        data: {
          referralCount: { increment: 1 },
        },
      });
    }
  }

  const dbUser = await prisma.user.create({
    data: {
      id: userId,
      name,
      imageUrl: user.imageUrl,
      referralCode: `UY-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      referrerId,
    },
  });

  return dbUser;
}
