"use client";

import { useEffect, useState } from "react";
import { useLocale } from "@/context/locale-context";
import ListingCard from "@/components/listing-card";
import { Search, Loader2 } from "lucide-react";
import VipListingsCarousel from "@/components/vip-listings-carousel";
import SquareListingCard from "@/components/square-listing-card";

export default function IkkilamchiPageSub() {
  const { t } = useLocale();
  const [listings, setListings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchListings() {
      try {
        const res = await fetch("/api/listings");
        if (res.ok) {
          const data = await res.json();
          setListings(data.listings || []);
        }
      } finally {
        setIsLoading(false);
      }
    }
    fetchListings();
  }, []);

  const vipListings: any[] = [];
  const regularListings: any[] = [];
  const userVipCount: Record<string, number> = {};

  listings.forEach((listing) => {
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
    <div className="container py-8">
      <div className="mb-10">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4 tracking-tight">{t("ikkilamchi.title")}</h1>
        <p className="text-gray-500 dark:text-gray-400 text-lg max-w-2xl font-medium">{t("ikkilamchi.subtitle")}</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : listings.length > 0 ? (
        <div className="flex flex-col gap-10">
          {vipListings.length > 0 && (
            <VipListingsCarousel listings={vipListings} />
          )}

          {regularListings.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {regularListings.map((listing) => (
                <SquareListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-gray-50 dark:bg-slate-900 rounded-[32px] border border-dashed border-border text-center">
          <Search className="h-10 w-10 text-gray-400 mb-4" />
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{t("common.not_found")}</h3>
          <p className="text-gray-500 dark:text-gray-400">{t("ikkilamchi.no_listings")}</p>
        </div>
      )}
    </div>
  );
}
