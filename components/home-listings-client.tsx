"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { PlusSquare, ArrowRight, MapPin, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SignInButton, useUser } from "@clerk/nextjs";
import ListingCard from "@/components/listing-card";
import SquareListingCard from "@/components/square-listing-card";
import SearchFilters from "@/components/search-filters";
import { useLocale } from "@/context/locale-context";
import VipListingsCarousel from "@/components/vip-listings-carousel";

interface HomeListingsClientProps {
  listings: any[];
  userId: string | null;
  locations?: any[];
}

export default function HomeListingsClient({ listings, userId, locations }: HomeListingsClientProps) {
  const { t, locale } = useLocale();
  const { isLoaded } = useUser();
  const [userCoords, setUserCoords] = useState<{lat: number, lng: number} | null>(null);
  const [isNearMeMode, setIsNearMeMode] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Request location on mount or when mode is toggled for the first time
  const handleLocationRequest = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setIsNearMeMode(true);
        setLocationError(null);
      },
      (error) => {
        console.error("Location error:", error);
        setLocationError("Location permission denied");
        setIsNearMeMode(false);
      }
    );
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; 
  };

  const vipListings: any[] = [];
  const regularListings: any[] = [];
  const userVipCount: Record<string, number> = {};

  listings.forEach((listing) => {
    // If Near Me mode is active, only include listings within 5km
    if (isNearMeMode && userCoords) {
      const distance = calculateDistance(userCoords.lat, userCoords.lng, listing.latitude, listing.longitude);
      if (distance > 5) return; // Skip if further than 5km
    }

    const userId = listing.user?.id;
    const isVipUser = listing.user?.plan === "VIP";

    if (isVipUser) {
      userVipCount[userId] = (userVipCount[userId] || 0) + 1;
      if (userVipCount[userId] <= 3) {
        vipListings.push(listing);
      } else {
        regularListings.push(listing);
      }
    } else {
      regularListings.push(listing);
    }
  });

  return (
    <section className="bg-background" id="listings-section">
      <div className="container py-16 md:py-24">
        {/* Section header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <p className="text-primary text-sm font-bold uppercase tracking-widest mb-2">
              {isNearMeMode ? (t("home.near_me") || "Yaqinimdagilar") : (listings.length > 0 ? `${listings.length}+ ${t("home.listings_title").toLowerCase()}` : t("home.listings_title"))}
            </p>
            <h2 className="text-3xl md:text-4xl font-black text-foreground tracking-tight flex items-center gap-3">
              {isNearMeMode ? (t("home.near_me_title") || "Yaqiningizdagi e'lonlar") : t("home.listings_title")}
              {isNearMeMode && <MapPin className="h-8 w-8 text-primary animate-bounce" />}
            </h2>
            <p className="text-muted-foreground font-medium mt-2">
              {isNearMeMode 
                ? (t("home.near_me_desc") || "5 km radiusdagi e'lonlar ko'rsatilmoqda") 
                : t("home.listings_subtitle")}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button 
              onClick={() => isNearMeMode ? setIsNearMeMode(false) : handleLocationRequest()}
              variant={isNearMeMode ? "default" : "outline"}
              className={`rounded-xl px-6 h-12 font-bold gap-2 transition-all ${isNearMeMode ? 'shadow-lg shadow-primary/25' : ''}`}
            >
              {isNearMeMode ? (
                <> <Navigation className="h-4 w-4 fill-current" /> {t("home.all_listings") || "Hammasi"} </>
              ) : (
                <> <MapPin className="h-4 w-4" /> {t("home.near_me_btn") || "Yaqinimda (5km)"} </>
              )}
            </Button>

            <Button variant="ghost" asChild className="shrink-0 group font-semibold text-primary hover:text-primary hover:bg-primary/8 rounded-xl gap-1">
              <Link href="/ikkilamchi">
                {t("home.view_all")}
                <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-8 items-start">
          {/* Listings Area */}
          <div className="w-full">
            {vipListings.length > 0 && (
              <VipListingsCarousel listings={vipListings} />
            )}

            {regularListings.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 mt-4">
                {regularListings.map((listing) => (
                  <SquareListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 border-2 border-dashed border-border rounded-3xl text-center bg-muted/20">
                <div className="h-20 w-20 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                  <PlusSquare className="h-9 w-9 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-3">{t("home.no_listings") || "E'lonlar topilmadi"}</h3>
                <p className="text-muted-foreground max-w-sm mb-8 text-[15px] leading-relaxed">{t("home.no_listings_desc") || "Qidiruv shartlariga mos keladigan e'lonlar hozircha yo'q."}</p>

                {!isLoaded ? (
                  <div className="h-12 w-48 bg-muted animate-pulse rounded-xl" />
                ) : userId ? (
                  <Button asChild size="lg" className="rounded-xl px-8 h-12 font-bold shadow-sm shadow-primary/20">
                    <Link href="/listings/create" className="flex items-center text-white">
                      <PlusSquare className="mr-2 h-4 w-4 text-white" />
                      <span className="text-white">{t("home.post_listing") || "E'lon joylashtirish"}</span>
                    </Link>
                  </Button>
                ) : (
                  <SignInButton mode="modal">
                    <Button size="lg" className="rounded-xl px-8 h-12 font-bold shadow-sm shadow-primary/20 text-white">
                      <PlusSquare className="mr-2 h-4 w-4 text-white" />
                      {t("home.post_listing") || "E'lon joylashtirish"}
                    </Button>
                  </SignInButton>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
