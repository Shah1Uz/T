import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { listingService } from "@/server/services/listing.service";
import { pusherServer } from "@/lib/pusher-server";
import { uploadFile } from "@/lib/upload";
import { revalidatePath } from "next/cache";
import { syncUser } from "@/lib/auth";
import { listingSchema } from "@/lib/validations";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const filters = {
    locationId: searchParams.get("locationId") || undefined,
    type: searchParams.get("type") || undefined,
    propertyType: searchParams.get("propertyType") || undefined,
    minPrice: searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : undefined,
    maxPrice: searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined,
    rooms: searchParams.get("rooms") ? Number(searchParams.get("rooms")) : undefined,
    searchQuery: searchParams.get("searchQuery") || undefined,
  };
  const page = Number(searchParams.get("page")) || 1;

  try {
    const data = await listingService.getAll(filters, page);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch listings" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await syncUser();

  try {
    const body = await req.json();
    const { images, ...rest } = body;
    
    // Validate with Zod
    const validation = listingSchema.safeParse(rest);
    if (!validation.success) {
      return NextResponse.json({ error: "Invalid data", details: validation.error.format() }, { status: 400 });
    }

    if (!images || !Array.isArray(images) || images.length === 0) {
      return NextResponse.json({ error: "At least one image is required" }, { status: 400 });
    }

    // Ensure all images are valid strings
    const validImages = images.filter((img): img is string => typeof img === 'string' && img.trim() !== '');
    if (validImages.length === 0) {
      return NextResponse.json({ error: "No valid image URLs provided" }, { status: 400 });
    }

    const listing = await listingService.create({ ...validation.data, userId }, validImages);
    
    // Real-time broadcast for new listings
    if (pusherServer) {
      await pusherServer.trigger("global-listings", "new-listing", listing);
    }

    // Clear Next.js cache
    revalidatePath("/");
    revalidatePath("/home");
    revalidatePath("/listings");
    
    return NextResponse.json(listing);
  } catch (error: any) {
    console.error("CREATE LISTING ERROR:", error);
    return NextResponse.json({ error: "Failed to create listing", details: error.message || String(error) }, { status: 500 });
  }
}
