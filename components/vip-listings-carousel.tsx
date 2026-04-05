"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
          {listings.map((listing) => {
             const primaryImage = listing.images?.[0]?.url || "/placeholder-property.jpg";
             const price = (listing.price || 0).toLocaleString("en-US").replace(/,/g, " ");
             const userAvatar = listing.user?.imageUrl || "/default-avatar.png";
             const userName = listing.user?.name || listing.phone || "";

             return (
               <Link 
                 key={listing.id} 
                 href={`/listings/${listing.id}`}
                 className="block shrink-0 w-[260px] md:w-[280px] lg:w-[300px] snap-start group/card transition-all duration-300"
               >
                 {/* Image Container */}
                 <div className="relative aspect-square w-full rounded-[24px] md:rounded-[32px] overflow-hidden bg-muted mb-3">
                   <Image
                     src={primaryImage}
                     alt={listing.title}
                     fill
                     className="object-cover transition-transform duration-700 ease-out group-hover/card:scale-105"
                   />
                   
                   {/* Top Left: Avatar and Name (Keep in place) */}
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

                   {/* Top Right: VIP Ribbon/Badge */}
                   <div className="absolute top-3 right-3 z-20 bg-indigo-600 text-white font-black text-[10px] tracking-widest px-2 py-1 rounded-lg shadow-md uppercase">
                     VIP
                   </div>

                   {/* Subtle bottom gradient for image protection if needed, though text is below now */}
                   <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent z-10" />
                 </div>

                 {/* Text Content - Below Image (Airbnb Style) */}
                 <div className="px-1 space-y-0.5">
                   <div className="flex items-start justify-between gap-2">
                     <h3 className="text-foreground font-bold text-[16px] md:text-[17px] line-clamp-1">
                       {listing.title}
                     </h3>
                     <div className="flex shrink-0 items-center gap-1 text-[14px]">
                       <span className="text-amber-500 font-bold">★</span>
                       <span className="font-semibold text-foreground">{(4.5 + Math.random() * 0.5).toFixed(2)}</span>
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
                 </div>
               </Link>
             );
          })}
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
