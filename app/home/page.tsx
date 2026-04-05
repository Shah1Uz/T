import { listingService } from "@/server/services/listing.service";
import { locationService } from "@/server/services/location.service";
import { auth } from "@clerk/nextjs/server";
import Hero from "@/components/hero";
import HomeListingsClient from "@/components/home-listings-client";
import { bannerService } from "@/server/services/banner.service";
import BannerCarousel from "@/components/banner-carousel";
import { getActiveStoriesAction } from "@/server/actions/story.action";
import StoriesBar from "@/components/stories/stories-bar";

export default async function HomePage(props: { searchParams?: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const params = props.searchParams ? await props.searchParams : {};
  
  const filters: any = {};
  if (typeof params.type === "string") filters.type = params.type;
  if (typeof params.locationId === "string") filters.locationId = params.locationId;
  if (typeof params.minPrice === "string" && !isNaN(Number(params.minPrice))) filters.minPrice = Number(params.minPrice);
  if (typeof params.maxPrice === "string" && !isNaN(Number(params.maxPrice))) filters.maxPrice = Number(params.maxPrice);
  if (typeof params.searchQuery === "string") filters.searchQuery = params.searchQuery;

  const { listings } = await listingService.getAll(filters);
  const locations = await locationService.getRegions();
  const { userId } = await auth();
  const activeBanners = await bannerService.getActive();
  const { stories } = await getActiveStoriesAction();

  return (
    <div className="flex flex-col min-h-screen pt-4">
      <HomeListingsClient listings={listings} userId={userId} locations={locations} />
    </div>
  );
}
