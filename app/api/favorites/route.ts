import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { favoriteService } from "@/server/services/favorite.service";
import { syncUser } from "@/lib/auth";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await syncUser();

  try {
    const { listingId } = await req.json();
    const favorite = await favoriteService.toggle(userId, listingId);
    return NextResponse.json(favorite);
  } catch (error) {
    return NextResponse.json({ error: "Failed to toggle favorite" }, { status: 500 });
  }
}

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const favorites = await favoriteService.getByUser(userId);
    return NextResponse.json(favorites);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch favorites" }, { status: 500 });
  }
}
