import { auth, currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function syncUser() {
  const { userId } = await auth();
  const user = await currentUser();

  if (!userId || !user) return null;

  const name = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Foydalanuvchi';

  const dbUser = await prisma.user.upsert({
    where: { id: userId },
    update: {
      name,
      imageUrl: user.imageUrl,
    },
    create: {
      id: userId,
      name,
      imageUrl: user.imageUrl,
    },
  });

  return dbUser;
}
