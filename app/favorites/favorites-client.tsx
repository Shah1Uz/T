"use client";

import ListingCard from "@/components/listing-card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Heart } from "lucide-react";
import { useLocale } from "@/context/locale-context";

interface FavoritesClientProps {
  listings: any[];
  userId: string | null;
}

export default function FavoritesClient({ listings, userId }: FavoritesClientProps) {
  const { t } = useLocale();

  if (!userId) {
    return (
      <div className="container py-10 flex flex-col items-center justify-center min-h-[50vh]">
         <div className="h-20 w-20 bg-muted rounded-full flex items-center justify-center mb-6">
            <Heart className="h-10 w-10 text-muted-foreground" />
         </div>
         <h3 className="text-2xl font-bold mb-2">{t("favorites.not_logged_in")}</h3>
         <p className="text-muted-foreground text-lg mb-8 max-w-md text-center">{t("favorites.not_logged_in_desc")}</p>
         <Button size="lg" className="rounded-xl px-8 font-bold shadow-none" asChild>
           <Link href="/sign-in">{t("common.sign_in")}</Link>
         </Button>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="flex-1 min-w-0 w-full">
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3 truncate">
            <Heart className="h-7 w-7 md:h-8 md:w-8 text-primary fill-primary shrink-0" />
            <span className="truncate">{t("favorites.title")}</span>
          </h1>
          <p className="text-muted-foreground text-sm md:text-base mt-1 truncate">{t("favorites.subtitle")}</p>
        </div>
      </div>

      {listings.length > 0 ? (
        <div className="flex flex-col gap-5 sm:gap-6">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 px-4 bg-muted/30 rounded-[32px] border border-border shadow-inner text-center mt-6">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-red-100 dark:bg-red-900/30 rounded-full animate-ping opacity-50"></div>
            <div className="h-[90px] w-[90px] bg-red-50 dark:bg-red-950/50 rounded-full flex items-center justify-center relative shadow-sm border border-red-50/50">
               <Heart className="h-10 w-10 text-red-500 fill-red-400 opacity-80" />
            </div>
          </div>
          <h3 className="text-[28px] font-extrabold text-foreground mb-3 tracking-tight">{t("favorites.no_listings")}</h3>
          <p className="text-muted-foreground text-[17px] mb-8 max-w-md leading-relaxed font-medium">{t("favorites.no_listings_desc")}</p>
          <Button size="lg" className="rounded-xl px-8 font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-0.5 transition-all duration-300 h-14 text-base" asChild>
            <Link href="/">{t("common.home_back")}</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
