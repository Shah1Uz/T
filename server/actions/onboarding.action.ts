"use server";

import { revalidatePath } from "next/cache";

export async function setUserRoleAction(role: string): Promise<{ success: boolean; error?: string }> {
  try {
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Xatolik yuz berdi" };
  }
}
