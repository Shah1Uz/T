"use server";

import { bannerService } from "../services/banner.service";
import { revalidatePath } from "next/cache";

export async function createBannerAction(data: { 
  imageUrl: string; 
  title?: string;
  subtext?: string;
  buttonText?: string;
  bgPattern?: string;
  bgColor?: string;
  link?: string; 
  isActive?: boolean; 
  order?: number; 
  width?: string; 
  height?: string; 
  duration?: number 
}) {
  try {
    const banner = await bannerService.create(data);
    revalidatePath("/admin/banners");
    revalidatePath("/");
    return { success: true, banner };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateBannerAction(id: string, data: Partial<{ 
  imageUrl: string; 
  title: string;
  subtext: string;
  buttonText: string;
  bgPattern: string;
  bgColor: string;
  link: string; 
  isActive: boolean; 
  order: number;
  width: string;
  height: string;
  duration: number;
}>) {
  try {
    const banner = await bannerService.update(id, data);
    revalidatePath("/admin/banners");
    revalidatePath("/");
    return { success: true, banner };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function toggleBannerActiveAction(id: string, isActive: boolean) {
  try {
    await bannerService.toggleActive(id, isActive);
    revalidatePath("/admin/banners");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteBannerAction(id: string) {
  try {
    await bannerService.delete(id);
    revalidatePath("/admin/banners");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
