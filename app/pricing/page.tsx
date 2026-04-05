import PricingSection from "@/components/pricing-section";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
 
export default async function PricingPage() {
  const { userId } = await auth();
  let userPlan = "FREE";

  if (userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { plan: true }
    });
    if (user) userPlan = user.plan;
  }

  return (
    <div className="container mx-auto pt-32 pb-20 px-4">
      <div className="max-w-6xl mx-auto">
        <PricingSection currentPlan={userPlan} />
      </div>
    </div>
  );
}
