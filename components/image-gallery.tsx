"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { useLocale } from "@/context/locale-context";
import { MapPin, X, ChevronLeft, ChevronRight, Maximize2, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageGalleryProps {
  listing: any;
}

export default function ImageGallery({ listing }: ImageGalleryProps) {
  const { t } = useLocale();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const images = listing.images && listing.images.length > 0 
    ? listing.images 
    : [{ url: "/placeholder-property.jpg" }];

  const openFullscreen = (index: number) => {
    setCurrentIndex(index);
    setIsFullscreen(true);
    document.body.style.overflow = "hidden"; // Prevent background scrolling
  };

  const closeFullscreen = () => {
    setIsFullscreen(false);
    document.body.style.overflow = "auto";
  };

  const goToNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const goToPrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  // Keyboard navigation for Lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isFullscreen) return;
      if (e.key === "Escape") closeFullscreen();
      if (e.key === "ArrowRight") setCurrentIndex((p) => (p === images.length - 1 ? 0 : p + 1));
      if (e.key === "ArrowLeft") setCurrentIndex((p) => (p === 0 ? images.length - 1 : p - 1));
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen, images.length]);

  return (
    <>
      {/* Main Preview Container */}
      <div className="group relative rounded-[32px] overflow-hidden bg-muted shadow-2xl border border-border cursor-pointer" onClick={() => openFullscreen(0)}>
        <div className="relative aspect-[16/9] md:aspect-[21/9] w-full">
          <Image 
            src={images[0]?.url} 
            alt={listing.title} 
            fill 
            className="object-cover transition-transform duration-1000 group-hover:scale-105"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent transition-opacity group-hover:opacity-90"></div>
          
          <div className="absolute top-4 left-4 flex flex-wrap gap-1.5 z-10">
            <Badge className="bg-card/95 backdrop-blur-sm text-foreground hover:bg-white px-2.5 py-1 rounded-lg font-bold shadow-md border-none text-[10px] uppercase tracking-tighter">
              {listing.type === "sale" ? t("listing.sale") || "Sotuv" : t("listing.rent") || "Ijara"}
            </Badge>
            <Badge className="bg-primary/95 backdrop-blur-sm text-white px-2.5 py-1 rounded-lg font-bold shadow-md border-none text-[10px] uppercase tracking-tighter">
              {listing.propertyType === "apartment" ? t("listing.apartment") || "Kvartira" : t("listing.house") || "Hovli"}
            </Badge>
          </div>

          {/* Show all photos button overlay */}
          <div className="absolute top-4 right-4 z-10">
            <Button variant="secondary" size="sm" className="h-8 bg-card/90 backdrop-blur-sm hover:bg-white text-foreground shadow-md rounded-lg font-bold flex items-center gap-1.5 px-3">
              <ImageIcon className="w-3.5 h-3.5" />
              <span className="text-[11px]">{t("listing.photos")} ({images.length})</span>
            </Button>
          </div>

          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
             <div className="bg-black/50 backdrop-blur-sm p-4 rounded-full text-white">
               <Maximize2 className="w-8 h-8" />
             </div>
          </div>
        </div>
        
        {/* Title overlay */}
        <div className="absolute bottom-4 left-4 z-10 w-fit max-w-[85%]">
            <div className="bg-black/40 backdrop-blur-md p-2.5 sm:p-3.5 rounded-xl border border-white/10 shadow-xl">
              <h1 className="text-xs sm:text-base md:text-lg font-black text-white tracking-tight mb-0.5 line-clamp-1 leading-tight">{listing.title}</h1>
              <div className="flex items-center gap-1.5 text-white/90">
                <MapPin className="h-3 w-3 text-white/80" />
                <span className="text-[10px] sm:text-xs font-medium leading-none">{listing.location?.name}</span>
              </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Lightbox Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col animate-in fade-in duration-200">
          {/* Lightbox Header */}
          <div className="absolute top-0 left-0 right-0 p-4 sm:p-6 flex justify-between items-center z-50 bg-gradient-to-b from-black/80 to-transparent">
            <div className="text-white bg-black/50 px-4 py-2 rounded-full font-medium tracking-widest text-sm backdrop-blur-md border border-white/10">
              {currentIndex + 1} / {images.length}
            </div>
            
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={closeFullscreen}
              className="text-white hover:bg-white/20 rounded-full h-12 w-12 bg-black/50 backdrop-blur-md border border-white/10"
            >
              <X className="w-6 h-6" />
            </Button>
          </div>

          {/* Main Image View */}
          <div className="flex-1 relative flex items-center justify-center p-4">
            <div className="relative w-full h-full flex items-center justify-center overflow-hidden" onClick={closeFullscreen}>
              <img 
                src={images[currentIndex].url} 
                alt={`${listing.title} - ${currentIndex + 1}`} 
                className="max-w-full max-h-full object-contain select-none cursor-default"
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking image
              />
            </div>
            
            {/* Navigation Buttons */}
            {images.length > 1 && (
              <>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={goToPrev}
                  className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 rounded-full h-12 w-12 sm:h-16 sm:w-16 bg-black/40 backdrop-blur-md border border-white/10 z-50 transform transition-transform hover:scale-110"
                >
                  <ChevronLeft className="w-8 h-8 sm:w-10 sm:h-10" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={goToNext}
                  className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 rounded-full h-12 w-12 sm:h-16 sm:w-16 bg-black/40 backdrop-blur-md border border-white/10 z-50 transform transition-transform hover:scale-110"
                >
                  <ChevronRight className="w-8 h-8 sm:w-10 sm:h-10" />
                </Button>
              </>
            )}
          </div>

          {/* Thumbnail Strip */}
          {images.length > 1 && (
            <div className="h-24 sm:h-32 w-full bg-black/80 border-t border-white/10 p-4 flex items-center justify-center gap-2 overflow-x-auto z-50">
              {images.map((img: any, idx: number) => (
                <div 
                  key={idx} 
                  onClick={() => setCurrentIndex(idx)}
                  className={`relative h-16 w-24 sm:h-20 sm:w-32 rounded-lg overflow-hidden shrink-0 cursor-pointer transition-all ${idx === currentIndex ? 'ring-2 ring-primary opacity-100 scale-105' : 'opacity-50 hover:opacity-100'}`}
                >
                  <Image src={img.url} alt="Thumbnail" fill className="object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
