"use server";

import { adminService } from "../services/admin.service";
import { newsService } from "../services/news.service";
import { revalidatePath } from "next/cache";

export async function getNewsAction() {
  try {
    const news = await newsService.getAll();
    return { success: true, news };
  } catch (error: any) {
    console.error("Failed to get news:", error);
    return { success: false, error: error.message };
  }
}

export async function createNewsAction(data: any) {
  try {
    const news = await newsService.create(data);
    revalidatePath("/news");
    revalidatePath("/admin");
    return { success: true, news };
  } catch (error: any) {
    console.error("Failed to create news:", error);
    return { success: false, error: error.message };
  }
}

export async function updateNewsAction(id: string, data: any) {
  try {
    const news = await newsService.update(id, data);
    revalidatePath("/news");
    revalidatePath("/admin");
    return { success: true, news };
  } catch (error: any) {
    console.error("Failed to update news:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteNewsAction(id: string) {
  try {
    await newsService.delete(id);
    revalidatePath("/news");
    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete news:", error);
    return { success: false, error: error.message };
  }
}
