import { listingService } from "@/server/services/listing.service";
import { locationService } from "@/server/services/location.service";
import { auth } from "@clerk/nextjs/server";
import HomeListingsClient from "@/components/home-listings-client";
import Navbar from "@/components/navbar";

export default async function SearchPage(props: { searchParams?: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const params = props.searchParams ? await props.searchParams : {};
  
  const filters: any = {};
  const query = typeof params.q === "string" ? params.q : undefined;
  if (query) filters.searchQuery = query;
  
  if (typeof params.type === "string") filters.type = params.type;
  if (typeof params.locationId === "string") filters.locationId = params.locationId;
  if (typeof params.minPrice === "string" && !isNaN(Number(params.minPrice))) filters.minPrice = Number(params.minPrice);
  if (typeof params.maxPrice === "string" && !isNaN(Number(params.maxPrice))) filters.maxPrice = Number(params.maxPrice);

  const [{ listings }, locations, { userId }] = await Promise.all([
    listingService.getAll(filters),
    locationService.getRegions(),
    auth()
  ]);

  return (
    <div className="flex flex-col min-h-screen pt-12">
      <div className="container py-8 md:py-12">
        <div className="max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
            Qidiruv natijalari
          </h1>
          {query ? (
            <p className="text-xl text-muted-foreground font-medium">
              "<span className="text-primary font-bold">{query}</span>" uchun topilgan e'lonlar
            </p>
          ) : (
            <p className="text-xl text-muted-foreground font-medium">
              Barcha e'lonlar
            </p>
          )}
        </div>
      </div>
      
      <HomeListingsClient 
        listings={listings} 
        userId={userId} 
        locations={locations} 
      />
    </div>
  );
}
