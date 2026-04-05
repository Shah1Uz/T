"use server";

import { storyService } from "../services/story.service";
import { revalidatePath } from "next/cache";
import { currentUser, auth } from "@clerk/nextjs/server";

const ADMIN_EMAIL = "shahuztech@gmail.com";

async function isAdmin() {
  const user = await currentUser();
  return user?.emailAddresses[0]?.emailAddress === ADMIN_EMAIL;
}

export async function createStoryAction(data: { imageUrl?: string; videoUrl?: string }) {
  try {
    console.log("Creating story with data:", data);
    const user = await currentUser();
    console.log("Current user:", user?.emailAddresses[0]?.emailAddress);

    if (!user || user.emailAddresses[0]?.emailAddress !== ADMIN_EMAIL) {
      console.log("Unauthorized attempt to create story");
      throw new Error("Unauthorized");
    }

    const story = await storyService.create({
      ...data,
      userId: user.id
    });
    console.log("Story created successfully:", story.id);

    revalidatePath("/");
    revalidatePath("/admin/stories");
    return { success: true, story };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getActiveStoriesAction() {
  try {
    const { userId } = await auth();
    const stories = await storyService.getActive();
    
    // Check if each story is liked by the current user
    const storiesWithLiked = [];
    for (const story of stories) {
      storiesWithLiked.push({
        ...story,
        isLiked: userId ? await storyService.isLikedByUser(story.id, userId) : false
      });
    }

    return { success: true, stories: storiesWithLiked };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function toggleStoryLikeAction(storyId: string) {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Unauthorized" };

    await storyService.toggleLike(storyId, userId);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getStoryLikesAction(storyId: string) {
  try {
    if (!(await isAdmin())) {
      return { success: false, error: "Unauthorized" };
    }

    const likes = await storyService.getStoryLikes(storyId);
    return { success: true, likes };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteStoryAction(id: string) {
  try {
    if (!(await isAdmin())) {
      throw new Error("Unauthorized");
    }

    await storyService.delete(id);
    revalidatePath("/");
    revalidatePath("/admin/stories");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getAllStoriesAction() {
  try {
    if (!(await isAdmin())) {
      throw new Error("Unauthorized");
    }

    const stories = await storyService.getAll();
    return { success: true, stories };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function recordStoryViewAction(storyId: string) {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Unauthorized" };

    await storyService.recordView(storyId, userId);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getStoryViewsAction(storyId: string) {
  try {
    if (!(await isAdmin())) {
      return { success: false, error: "Unauthorized" };
    }

    const views = await storyService.getStoryViews(storyId);
    return { success: true, views };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
