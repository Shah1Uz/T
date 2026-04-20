"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";
import { Heart, Sparkles, Zap, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import VerifiedBadge from "@/components/verified-badge";
import { useLocale } from "@/context/locale-context";

export default function SquareListingCard({ listing }: { listing: any }) {
  const { t } = useLocale();
  const router = useRouter();
  const { user, isSignedIn } = useUser();
  const [isFavorited, setIsFavorited] = useState(false);
  const [rating, setRating] = useState(listing.ratingAverage || 0);
  const [ratingCount, setRatingCount] = useState(listing.ratingCount || 0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const images = listing.images || [];
  const imageCount = images.length;

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % imageCount);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === 0 ? imageCount - 1 : prev - 1));
  };

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
    <div className="group block w-full space-y-3">
      {/* Image Container - Interactive Carousel (Not a Link anymore) */}
      <div 
        className="relative aspect-[4/3] w-full overflow-hidden rounded-[16px] bg-muted cursor-pointer"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = e.clientX - rect.left;
          if (x > rect.width / 2) {
            handleNext(e);
          } else {
            handlePrev(e);
          }
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentImageIndex}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0"
          >
            <Image
              src={images[currentImageIndex]?.url || "/placeholder-property.jpg"}
              alt={listing.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </motion.div>
        </AnimatePresence>
        
        {/* Navigation Arrows (Only on hover, desktop) */}
        {imageCount > 1 && (
          <>
            <button 
              onClick={handlePrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-30 w-7 h-7 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-md text-white opacity-0 group-hover:opacity-100 transition-opacity hidden md:flex"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button 
              onClick={handleNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-30 w-7 h-7 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-md text-white opacity-0 group-hover:opacity-100 transition-opacity hidden md:flex"
            >
              <ChevronRight className="h-4 w-4" />
            </button>

            {/* Mobile Touch Indicators (Dots) */}
            <div className="absolute bottom-2 inset-x-2 flex justify-center gap-1.5 z-20">
              {images.slice(0, 5).map((_: any, i: number) => (
                <div 
                  key={i} 
                  className={`h-1 rounded-full transition-all duration-300 ${i === currentImageIndex ? "w-4 bg-white" : "w-1 bg-white/50"}`}
                />
              ))}
            </div>
          </>
        )}
        
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

      {/* Info Section - Airbnb Style with Link */}
      <div className="flex flex-col gap-0.5 px-0.5">
        <Link href={`/listings/${listing.id}`} className="flex items-start justify-between gap-2 hover:opacity-80 transition-opacity">
          <h3 className="line-clamp-1 text-[14px] sm:text-[15px] font-bold text-foreground">
            {locationName}, {listing.title}
          </h3>
          {listing.user?.plan !== "VIP" && (
            <div className="flex shrink-0 items-center gap-1 text-[12px] sm:text-[13px]">
              <span className="text-amber-500 font-bold">★</span>
              <span className="font-bold">{Number(rating).toFixed(1)}</span>
            </div>
          )}
        </Link>
        
        <Link href={`/listings/${listing.id}`} className="block">
          <p className="line-clamp-1 text-[13px] sm:text-[14px] text-muted-foreground font-normal">
            Topshirish: {listing.deliveryDate || "Tez kunda"}
          </p>
          
          <div className="mt-1 flex items-baseline gap-1 text-[14px] sm:text-[15px]">
            <span className="font-bold text-foreground">{price} y.e</span>
            <span className="text-muted-foreground font-normal">/ {listing.type === 'rent' ? 'oy' : 'jami'}</span>
          </div>
        </Link>
      </div>
    </div>
  );
}
