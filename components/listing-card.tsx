"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { 
  MapPin, Heart, Phone, BedDouble, 
  Maximize2, Layers, Trash2, TrainFront,
  Share2, ArrowUpRight, CheckCircle2,
  Calendar, Sparkles, Zap, ChevronLeft, ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/context/locale-context";
import VerifiedBadge from "@/components/verified-badge";
import { toast } from "sonner";

export default function ListingCard({ listing }: { listing: any }) {
  const { t, locale } = useLocale();
  const router = useRouter();
  const { user, isLoaded, isSignedIn } = useUser();
  const [isFavorited, setIsFavorited] = useState(false);
  const [likeCount, setLikeCount] = useState(listing.favorites?.length || 0);
  const [rating, setRating] = useState(listing.ratingAverage || 0);
  const [ratingCount, setRatingCount] = useState(listing.ratingCount || 0);
  const [mounted, setMounted] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const images = (listing as any).images || [];
  const imageCount = images.length;

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

  useEffect(() => {
    setMounted(true);
    if (isLoaded && isSignedIn && listing.favorites) {
      setIsFavorited(listing.favorites.some((f: any) => f.userId === user.id));
    }
  }, [isLoaded, isSignedIn, listing.favorites, user]);

  if (!mounted) return (
    <div className="bg-card border border-border/60 rounded-[32px] overflow-hidden min-h-[220px] animate-pulse">
       <div className="w-full h-full bg-muted/50" />
    </div>
  );

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

  const perM2 = Math.round(listing.price / (listing.area || 50));
  const targetLabel = listing.landmark || `${listing.location?.name || ""}`;
  const metroText = listing.metroInfo || targetLabel;
  const userName = listing.user?.name || listing.phone || "";
  
  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/listings/${listing.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: listing.title,
          url
        });
      } catch {}
    } else {
      navigator.clipboard.writeText(url);
      toast.success(t("common.link_copied") || "Havola nusxalandi!");
    }
  };

  return (
    <div className={`group relative bg-card border rounded-[32px] overflow-hidden transition-all duration-500 flex flex-col md:flex-row min-h-[200px] ${
      listing.user?.plan === "VIP" 
        ? "border-amber-500/50 shadow-[0_20px_50px_-20px_rgba(245,158,11,0.15)] ring-1 ring-amber-500/20" 
        : listing.user?.plan === "STANDART"
          ? "border-blue-500/40 shadow-[0_20px_50px_-20px_rgba(59,130,246,0.12)]"
          : "border-border/60 hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)]"
    }`}>
      
      {/* Image Section - Interactive Carousel (Not a Link anymore) */}
      <div 
        className="relative w-full md:w-[280px] lg:w-[340px] xl:w-[380px] 3xl:w-[420px] shrink-0 aspect-[16/10] md:aspect-auto overflow-hidden md:m-2 rounded-t-[32px] md:rounded-[24px] bg-muted group/image cursor-pointer"
        onClick={(e) => {
          // If not clicking arrows, click right half for next, left half for prev
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
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <Image
              src={images[currentImageIndex]?.url || "/placeholder-property.jpg"}
              alt={listing.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            />
          </motion.div>
        </AnimatePresence>

        {/* Navigation Arrows */}
        {imageCount > 1 && (
          <>
            <button 
              onClick={handlePrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 items-center justify-center rounded-full bg-black/40 backdrop-blur-md text-white border border-white/10 hover:bg-black/60 transition-all opacity-0 group-hover/image:opacity-100 z-20 hidden md:flex"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button 
              onClick={handleNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 items-center justify-center rounded-full bg-black/40 backdrop-blur-md text-white border border-white/10 hover:bg-black/60 transition-all opacity-0 group-hover/image:opacity-100 z-20 hidden md:flex"
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            {/* Mobile Touch Navigation (Invisible zones) */}
            <div className="absolute inset-y-0 left-0 w-1/4 z-10 md:hidden" onClick={handlePrev} />
            <div className="absolute inset-y-0 right-0 w-1/4 z-10 md:hidden" onClick={handleNext} />
          </>
        )}

        {/* Type Badge Overlay */}
        <div className="absolute top-4 left-4 z-20">
          <span className={`text-[11px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl shadow-lg backdrop-blur-md ${
            listing.type === "sale"
              ? "bg-amber-400/90 text-amber-950"
              : "bg-emerald-400/90 text-emerald-950"
          }`}>
            {listing.type === "sale" ? t("listing.sale") : t("listing.rent")}
          </span>
        </div>

        {/* Plan Badge Overlay */}
        {listing.user?.plan && listing.user.plan !== "FREE" && (
          <div className="absolute top-4 right-4 z-20">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl shadow-lg backdrop-blur-md border ${
              listing.user.plan === "VIP" 
                ? "bg-amber-500 text-white border-amber-400" 
                : listing.user.plan === "STANDART"
                  ? "bg-blue-600 text-white border-blue-400"
                  : "bg-emerald-500 text-white border-emerald-400"
            }`}>
              {listing.user.plan === "VIP" ? <Sparkles className="h-3 w-3" /> : <Zap className="h-3 w-3" />}
              <span className="text-[10px] font-black uppercase tracking-widest">
                {listing.user.plan}
              </span>
            </div>
          </div>
        )}

        {/* Count Badge Overlay & Dots */}
        {imageCount > 1 && (
          <div className="absolute bottom-4 inset-x-4 flex items-center justify-between z-20">
            <div className="flex gap-1.5 p-1.5 bg-black/40 backdrop-blur-md rounded-full border border-white/10">
              {images.slice(0, 5).map((_: any, i: number) => (
                <div 
                  key={i} 
                  className={`h-1.5 rounded-full transition-all duration-300 ${i === currentImageIndex ? "w-6 bg-white" : "w-1.5 bg-white/40"}`}
                />
              ))}
              {imageCount > 5 && <div className="w-1.5 h-1.5 rounded-full bg-white/20" />}
            </div>
            <div className="bg-black/40 backdrop-blur-md text-white text-[11px] font-black px-3 py-1.5 rounded-xl border border-white/10 tabular-nums">
              {currentImageIndex + 1} / {imageCount}
            </div>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col p-5 md:p-6 lg:p-8 gap-4 min-w-0">
        
        {/* Top Header: Price & Title */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
           <div className="space-y-1.5">
               <Link href={`/listings/${listing.id}`} className="block hover:opacity-80 transition-opacity">
                 <div className="flex flex-wrap items-baseline gap-2 sm:gap-3">
                    <span className="text-2xl sm:text-3xl font-black text-foreground tabular-nums">
                      {(listing?.price || 0).toLocaleString("en-US")}
                      <span className="text-xl font-bold ml-1.5 uppercase">USD</span>
                    </span>
                    <span className="text-sm font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-lg">
                       {perM2.toLocaleString()} USD/m²
                    </span>
                    {/* Views Badge for Owner */}
                    {user?.id === listing.userId && listing._count?.views !== undefined && (
                      <span className="text-[10px] font-black bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-full flex items-center gap-1 border border-blue-500/20 shadow-sm animate-in fade-in slide-in-from-top-1">
                        <Maximize2 className="h-2.5 w-2.5 rotate-45" />
                        {listing._count.views} {t("common.views") || "ko'rishlar"}
                      </span>
                    )}
                 </div>
               </Link>
               <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                 <Link href={`/listings/${listing.id}`}>
                   <h3 className="text-xl font-black text-foreground group-hover:text-primary transition-colors line-clamp-1 leading-tight flex items-center gap-2">
                     {listing.title}
                     {listing.user?.plan === "VIP" && <VerifiedBadge />}
                   </h3>
                 </Link>
                {listing.user?.plan !== "VIP" && (
                  <div 
                    className="flex items-center gap-1 bg-muted/40 px-3 py-1.5 rounded-xl border border-border/40 shrink-0"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                  >
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Sparkles 
                          key={s}
                          onClick={(e) => {
                            e.preventDefault();
                            handleRate(s);
                          }}
                          className={`h-3.5 w-3.5 cursor-pointer transition-all hover:scale-125 ${s <= Math.round(rating) ? "fill-amber-500 text-amber-500" : "fill-muted text-muted-foreground opacity-30"}`}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-black ml-1.5 tabular-nums">{Number(rating).toFixed(1)}</span>
                    {ratingCount > 0 && <span className="text-[11px] font-bold opacity-50">({ratingCount})</span>}
                  </div>
                )}
              </div>
           </div>

           {/* Desktop Action Buttons (Right Aligned) */}
           <div className="hidden sm:flex flex-col items-end gap-2.5 shrink-0">
              <a href={`tel:${listing.phone || "+998900000000"}`}>
                <Button className={`h-11 sm:h-12 px-5 sm:px-6 rounded-2xl font-bold text-sm sm:text-base shadow-lg gap-2 ${
                  listing.user?.plan === "VIP" 
                    ? "bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20" 
                    : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20"
                }`}>
                   <Phone className="h-4 w-4" />
                   {locale === "uz" ? "Tel" : "Тел"}
                </Button>
              </a>
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const targetId = listing.user?.id || listing.userId;
                  if (targetId) {
                    router.push(`/profile/${targetId}`);
                  }
                }}
                className="text-[10px] sm:text-xs font-bold text-muted-foreground hover:text-primary cursor-pointer flex items-center gap-2 pointer-events-auto"
              >
                 <div className="flex items-center gap-1">
                   {userName}
                   {listing.user?.isVerified && <VerifiedBadge />}
                 </div>
                 <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${listing.type === 'sale' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-blue-500/10 text-blue-600 border border-blue-500/20'}`}>
                   {listing.type === 'sale' ? t("listing.sale") : t("listing.rent")}
                 </span>
              </button>
           </div>
        </div>

        {/* Info Rows */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-4 sm:gap-x-8">
           {listing.deliveryDate && (
             <div className="flex items-center gap-3 text-sm font-bold text-muted-foreground/90">
                <div className="h-8 w-8 rounded-lg bg-primary/5 flex items-center justify-center shrink-0">
                   <Calendar className="h-4 w-4 text-primary" />
                </div>
                <span>{locale === "uz" ? "Topshirish" : "Сдача"}: {listing.deliveryDate}</span>
             </div>
           )}
           <div className="flex items-center gap-3 text-sm font-bold text-muted-foreground/90">
              <div className="h-8 w-8 rounded-lg bg-primary/5 flex items-center justify-center shrink-0">
                 <MapPin className="h-4 w-4 text-primary" />
              </div>
              <span className="truncate">{listing.location?.name || "Toshkent shahri"}</span>
           </div>
           <div className="flex items-center gap-3 text-sm font-bold text-muted-foreground/90">
              <div className="h-8 w-8 rounded-lg bg-blue-500/5 flex items-center justify-center shrink-0">
                 <TrainFront className="h-4 w-4 text-blue-500" />
              </div>
              <span className="truncate">{metroText}</span>
           </div>
        </div>

        {/* Target Box (Mo'ljal) */}
        <div className="bg-muted/30 dark:bg-muted/10 border border-border/40 p-3 sm:p-4 rounded-2xl flex items-start gap-3">
           <div className="h-9 w-9 rounded-xl bg-muted flex items-center justify-center shrink-0">
             <MapPin className="h-4 w-4 text-muted-foreground" />
           </div>
           <p className="text-[13px] sm:text-sm font-bold text-foreground leading-snug">
             <span className="block text-[9px] sm:text-[10px] uppercase tracking-tighter opacity-70 mb-0.5">{t("listing.target")}:</span>
             {targetLabel}
           </p>
        </div>

        {/* Mobile Action Button (Only on mobile) */}
        <div className="sm:hidden grid grid-cols-1 gap-3">
           <a href={`tel:${listing.phone || "+998900000000"}`}>
              <Button className={`w-full h-12 rounded-2xl font-bold gap-2 ${
                 listing.user?.plan === "VIP" ? "bg-amber-500 text-white" : "bg-indigo-600 text-white"
              }`}>
                 <Phone className="h-4 w-4" />
                 {locale === "uz" ? "Telefon raqami" : "Номер телефона"}
              </Button>
           </a>
        </div>

        {/* Bottom Footer: Stats & Small Badges */}
        <div className="mt-auto pt-6 flex flex-wrap items-center justify-between gap-4 border-t border-border/40">
           <div className="flex flex-wrap gap-5">
              <div className="flex items-center gap-2.5 text-[13px] font-black text-foreground group/stat">
                 <div className="h-8 w-8 rounded-full bg-primary/5 flex items-center justify-center group-hover/stat:bg-primary/10 transition-colors">
                    <BedDouble className="h-4 w-4 text-primary" />
                 </div>
                 {listing.rooms || "—"} {t("common.rooms")}
              </div>
              <div className="flex items-center gap-2.5 text-[13px] font-black text-foreground group/stat">
                 <div className="h-8 w-8 rounded-full bg-primary/5 flex items-center justify-center group-hover/stat:bg-primary/10 transition-colors">
                    <Maximize2 className="h-4 w-4 text-primary" />
                 </div>
                 {listing.area || "—"} m²
              </div>
           </div>

           <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 rounded-xl bg-violet-500/10 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 text-[11px] font-black uppercase tracking-tighter">
                 {t("listing.installment")} 17 oy
              </span>
              <div className="h-9 w-px bg-border mx-1 hidden sm:block" />
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={async (e) => {
                    e.preventDefault();
                    if (!isSignedIn) return alert(t("nav.login"));
                    const old = isFavorited;
                    setIsFavorited(!old);
                    setLikeCount((prev: number) => old ? prev - 1 : prev + 1);
                    try { await fetch("/api/favorites", { method: "POST", body: JSON.stringify({ listingId: listing.id }) }); } catch { 
                      setIsFavorited(old); 
                      setLikeCount((prev: number) => old ? prev + 1 : prev - 1);
                    }
                  }}
                  className={`flex items-center gap-2 h-11 px-4 rounded-2xl border transition-all ${isFavorited ? "bg-red-500 text-white border-red-500 shadow-lg shadow-red-500/20" : "bg-card dark:bg-muted border-border text-foreground hover:border-red-500 hover:text-red-500 shadow-sm"}`}
                >
                  <Heart className={`h-5 w-5 ${isFavorited ? "fill-current" : ""}`} />
                  {likeCount > 0 && <span className="text-sm font-black tabular-nums">{likeCount}</span>}
                </button>
                <button 
                  onClick={handleShare}
                  className="h-11 w-11 flex items-center justify-center rounded-2xl border border-border bg-card dark:bg-muted text-foreground hover:border-primary hover:text-primary transition-all shadow-sm"
                >
                  <Share2 className="h-5 w-5" />
                </button>
              </div>
           </div>
        </div>
      </div>

      {/* Admin Delete (Absolute overlay for owners) */}
      {user?.id === listing.userId && (
        <button 
          onClick={async (e) => {
            e.preventDefault();
            if (!confirm("O'chirishni tasdiqlaysizmi?")) return;
            const res = await fetch(`/api/listings/${listing.id}`, { method: "DELETE" });
            if (res.ok) window.location.reload();
          }}
          className="absolute top-4 right-4 z-20 h-10 w-10 flex items-center justify-center rounded-xl bg-red-500 text-white shadow-xl hover:bg-red-600 transition-all opacity-0 group-hover:opacity-100"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
