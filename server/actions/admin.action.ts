"use server";

import { adminService } from "../services/admin.service";
import { revalidatePath } from "next/cache";
import { clerkClient } from "@clerk/nextjs/server";

export async function toggleUserVerificationAction(id: string, isVerified: boolean) {
  try {
    await adminService.toggleUserVerification(id, isVerified);
    revalidatePath("/admin");
    revalidatePath("/listings"); // since listings show authors
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function toggleUserBlockAction(id: string, isBlocked: boolean) {
  try {
    // 1. Update Database
    await adminService.toggleUserBlock(id, isBlocked);

    // 2. Update Clerk Metadata
    const client = await clerkClient();
    await client.users.updateUserMetadata(id, {
      publicMetadata: { isBlocked }
    });

    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function changeUserPlanAction(id: string, newPlan: string, daysToAdd: number = 30) {
  try {
    await adminService.changeUserPlan(id, newPlan, daysToAdd);
    
    // Also update Clerk metadata so it stays synced if needed (optional, but good practice if you depend on it)
    const client = await clerkClient();
    await client.users.updateUserMetadata(id, {
      publicMetadata: { plan: newPlan }
    });

    revalidatePath("/admin");
    revalidatePath("/listings"); 
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
