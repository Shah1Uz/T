"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocale } from "@/context/locale-context";

interface VipListingsCarouselProps {
  listings: any[];
}

export default function VipListingsCarousel({ listings }: VipListingsCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { t } = useLocale();

  if (!listings || listings.length === 0) return null;

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -320, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 320, behavior: "smooth" });
    }
  };

  return (
    <div className="w-full mb-16 relative">
      <div className="flex items-center justify-between mb-6 px-2">
        <h2 className="text-2xl md:text-3xl font-black text-foreground tracking-tight flex items-center gap-3">
          VIP
        </h2>
        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={scrollLeft}
            className="h-10 w-10 rounded-full bg-muted/50 hover:bg-muted flex items-center justify-center transition-colors"
          >
            <ChevronLeft className="h-5 w-5 text-foreground" />
          </button>
          <button
            onClick={scrollRight}
            className="h-10 w-10 rounded-full bg-muted/50 hover:bg-muted flex items-center justify-center transition-colors"
          >
            <ChevronRight className="h-5 w-5 text-foreground" />
          </button>
        </div>
      </div>

      <div className="relative group">
        {/* Left Arrow (Mobile/Tablet) */}
        <button
          onClick={scrollLeft}
          className="md:hidden absolute left-2 top-1/2 -translate-y-1/2 z-20 h-12 w-12 rounded-full bg-background/90 backdrop-blur shadow-xl border border-border flex items-center justify-center text-foreground hover:bg-background transition-all"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>

        {/* Carousel Container */}
        <div 
          ref={scrollContainerRef}
          className="flex gap-4 md:gap-5 px-2 pb-6 overflow-x-auto snap-x snap-mandatory no-scrollbar"
        >
          {listings.map((listing) => (
            <VipCard key={listing.id} listing={listing} />
          ))}
        </div>

        {/* Right Arrow (Mobile/Tablet) */}
        <button
          onClick={scrollRight}
          className="md:hidden absolute right-2 top-1/2 -translate-y-1/2 z-20 h-12 w-12 rounded-full bg-background/90 backdrop-blur shadow-xl border border-border flex items-center justify-center text-foreground hover:bg-background transition-all"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
}

function VipCard({ listing }: { listing: any }) {
  const router = useRouter();
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

  const price = (listing.price || 0).toLocaleString("en-US").replace(/,/g, " ");
  const userAvatar = listing.user?.imageUrl || "/default-avatar.png";
  const userName = listing.user?.name || listing.phone || "";

  // Deterministic rating to avoid hydration mismatch
  const getRating = (id: string) => {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    return (4.5 + (Math.abs(hash) % 4) / 10).toFixed(1);
  };

  return (
    <div className="block shrink-0 w-[260px] md:w-[280px] lg:w-[300px] snap-start group/card transition-all duration-300 space-y-3">
      {/* Image Container - Interactive Carousel */}
      <div 
        className="relative aspect-square w-full rounded-[24px] md:rounded-[32px] overflow-hidden bg-muted cursor-pointer"
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
              className="object-cover transition-transform duration-700 ease-out group-hover/card:scale-105"
            />
          </motion.div>
        </AnimatePresence>
        
        {/* Navigation Arrows */}
        {imageCount > 1 && (
          <>
            <button 
              onClick={handlePrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-30 w-8 h-8 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-md text-white opacity-0 group-hover/card:opacity-100 transition-opacity hidden md:flex"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button 
              onClick={handleNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-30 w-8 h-8 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-md text-white opacity-0 group-hover/card:opacity-100 transition-opacity hidden md:flex"
            >
              <ChevronRight className="h-4 w-4" />
            </button>

            {/* Dots */}
            <div className="absolute bottom-3 inset-x-3 flex justify-center gap-1.5 z-20">
              {images.slice(0, 5).map((_: any, i: number) => (
                <div 
                  key={i} 
                  className={`h-1 rounded-full transition-all duration-300 ${i === currentImageIndex ? "w-5 bg-white" : "w-1 bg-white/50"}`}
                />
              ))}
            </div>
          </>
        )}
        
        {/* Top Left: Avatar and Name */}
        <button 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            const targetId = listing.user?.id || listing.userId;
            if (targetId) {
              router.push(`/profile/${targetId}`);
            }
          }}
          className="absolute top-3 left-3 z-30 flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-2 py-1 rounded-full border border-white/20 cursor-pointer hover:bg-black/60 transition-colors pointer-events-auto"
        >
          <div className="h-6 w-6 md:h-7 md:w-7 rounded-full overflow-hidden shrink-0">
            <Image
              src={userAvatar}
              alt={userName}
              width={28}
              height={28}
              className="object-cover w-full h-full"
            />
          </div>
          <span className="text-white font-bold text-xs md:text-[13px] truncate max-w-[120px]">
            {userName}
          </span>
        </button>

        {/* Top Right: VIP Badge */}
        <div className="absolute top-3 right-3 z-20 bg-indigo-600 text-white font-black text-[10px] tracking-widest px-2 py-1 rounded-lg shadow-md uppercase">
          VIP
        </div>
      </div>

      {/* Text Content - Below Image with Link */}
      <div className="px-1 space-y-0.5">
        <Link href={`/listings/${listing.id}`} className="block hover:opacity-80 transition-opacity">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-foreground font-bold text-[16px] md:text-[17px] line-clamp-1">
              {listing.title}
            </h3>
            <div className="flex shrink-0 items-center gap-1 text-[14px]">
              <span className="text-amber-500 font-bold">★</span>
              <span className="font-semibold text-foreground">{listing.ratingAverage || getRating(listing.id)}</span>
            </div>
          </div>
          <p className="text-muted-foreground text-[14px] font-normal truncate">
            {listing.location?.name || "Toshkent shahri"}
          </p>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-foreground font-bold text-[16px] md:text-[18px]">
              {price} y.e
            </span>
            <span className="text-muted-foreground text-[14px] font-normal">/ {listing.type === 'rent' ? 'oy' : 'jami'}</span>
          </div>
        </Link>
      </div>
    </div>
  );
}
