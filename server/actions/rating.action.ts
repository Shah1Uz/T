"use server";

import { ratingService } from "../services/rating.service";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function rateListingAction(listingId: string, rating: number) {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Tizimga kiring" };

    if (rating < 1 || rating > 5) return { success: false, error: "Reyting noto'g'ri" };

    const listing = await ratingService.rate(listingId, userId, rating);

    revalidatePath("/");
    revalidatePath("/home");
    revalidatePath(`/listings/${listingId}`);

    return { success: true, listing };
  } catch (error: any) {
    console.error("Rating error:", error);
    return { success: false, error: "Xatolik yuz berdi" };
  }
}

export async function getListingRatingAction(listingId: string): Promise<
  | { success: true; ratingAverage: number; ratingCount: number; userRating: number | null }
  | { success: false; error: string }
> {
  try {
    const { userId } = await auth();
    const data = await ratingService.getRating(listingId, userId || undefined);
    return { success: true, ...data };
  } catch (error: any) {
    return { success: false, error: error.message || "Xatolik yuz berdi" };
  }
}
