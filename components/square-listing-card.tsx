"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";
import { Heart, Sparkles, Zap } from "lucide-react";
import VerifiedBadge from "@/components/verified-badge";
import { useLocale } from "@/context/locale-context";

export default function SquareListingCard({ listing }: { listing: any }) {
  const { t } = useLocale();
  const router = useRouter();
  const { user, isSignedIn } = useUser();
  const [isFavorited, setIsFavorited] = useState(false);
  const [rating, setRating] = useState(listing.ratingAverage || 0);
  const [ratingCount, setRatingCount] = useState(listing.ratingCount || 0);

  useEffect(() => {
    if (isSignedIn && listing.favorites) {
      setIsFavorited(listing.favorites.some((f: any) => f.userId === user?.id));
    }
  }, [isSignedIn, listing.favorites, user]);

  const price = (listing.price || 0).toLocaleString("en-US").replace(/,/g, " ");
  const locationName = listing.location?.name || "Toshkent shahri";

  const handleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isSignedIn) return;
    
    const old = isFavorited;
    setIsFavorited(!old);
    try {
      await fetch("/api/favorites", {
        method: "POST",
        body: JSON.stringify({ listingId: listing.id }),
      });
    } catch {
      setIsFavorited(old);
    }
  };

  const handleRate = async (newRating: number) => {
    if (!isSignedIn) return;
    
    try {
      const { rateListingAction } = await import("@/server/actions/rating.action");
      const res = await rateListingAction(listing.id, newRating);
      if (res.success && res.listing) {
        setRating(res.listing.ratingAverage);
        setRatingCount(res.listing.ratingCount);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const primaryImage = listing.images?.[0]?.url || "/placeholder-property.jpg";
  const userAvatar = listing.user?.imageUrl || "/default-avatar.png";
  const userName = listing.user?.name || listing.phone || "";

  return (
    <Link 
      href={`/listings/${listing.id}`}
      className="group block w-full space-y-3"
    >
      {/* Image Container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[16px] bg-muted">
        <Image
          src={primaryImage}
          alt={listing.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        
        {/* Profile Badge (Keep in place as requested) */}
        <button 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            const targetId = listing.user?.id || listing.userId;
            if (targetId) {
              router.push(`/profile/${targetId}`);
            }
          }}
          className="absolute top-3 left-3 z-20 flex items-center gap-1.5 bg-black/30 backdrop-blur-md px-2 py-1 rounded-full border border-white/20 cursor-pointer hover:bg-black/50 transition-colors pointer-events-auto"
        >
          <div className="h-5 w-5 rounded-full overflow-hidden shrink-0">
            <Image
              src={userAvatar}
              alt={userName}
              width={20}
              height={20}
              className="object-cover w-full h-full"
            />
          </div>
          <span className="text-white text-[11px] font-bold truncate max-w-[80px]">
            {userName}
          </span>
        </button>

        {/* Favorite Button */}
        <button
          onClick={handleFavorite}
          className="absolute right-3 top-3 z-10"
        >
          <Heart
            className={`h-6 w-6 ${
              isFavorited ? "fill-[#FF385C] stroke-[#FF385C]" : "fill-black/30 stroke-white stroke-[1.5px]"
            }`}
          />
        </button>

        {/* Small Overlay Badge if VIP */}
        {listing.user?.plan === "VIP" && (
          <div className="absolute bottom-3 left-3 z-10 bg-white px-2 py-0.5 rounded-md shadow-sm border border-black/5">
            <span className="text-[10px] font-black uppercase text-black italic text-xs tracking-widest">VIP</span>
          </div>
        )}
      </div>

      {/* Info Section - Airbnb Style */}
      <div className="flex flex-col gap-0.5 px-0.5" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-1 text-[15px] font-bold text-foreground">
            {locationName}, {listing.title}
          </h3>
          {listing.user?.plan !== "VIP" && (
            <div className="flex shrink-0 items-center gap-1.5 text-[13px] bg-muted/30 px-2 py-0.5 rounded-lg border border-border/40">
              <div 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                className="flex items-center gap-0.5"
              >
                {[1, 2, 3, 4, 5].map((s) => (
                  <Sparkles 
                    key={s}
                    onClick={(e) => {
                      e.preventDefault();
                      handleRate(s);
                    }}
                    className={`h-3 w-3 cursor-pointer transition-all hover:scale-125 ${s <= Math.round(rating) ? "fill-amber-500 text-amber-500" : "fill-muted text-muted-foreground opacity-30"}`}
                  />
                ))}
                <span className="font-bold ml-1">{Number(rating).toFixed(1)}</span>
                {ratingCount > 0 && <span className="text-[10px] opacity-60">({ratingCount})</span>}
              </div>
            </div>
          )}
        </div>
        
        <p className="line-clamp-1 text-[14px] text-muted-foreground font-normal">
          Topshirish: {listing.deliveryDate || "Tez kunda"}
        </p>
        
        <div className="mt-1 flex items-baseline gap-1 text-[15px]">
          <span className="font-bold text-foreground">{price} y.e</span>
          <span className="text-muted-foreground font-normal">/ {listing.type === 'rent' ? 'oy' : 'jami'}</span>
        </div>
      </div>
    </Link>
  );
}
