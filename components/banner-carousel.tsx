"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function BannerCarousel({ banners }: { banners: any[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;

    const currentDuration = (banners[currentIndex]?.duration || 3) * 1000;

    const timeout = setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, currentDuration);

    return () => clearTimeout(timeout);
  }, [banners.length, currentIndex]);

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
  };

  if (!banners || banners.length === 0) return null;

  return (
    <div className="relative w-full max-w-6xl mx-auto overflow-hidden rounded-[32px] md:rounded-[48px] shadow-lg lg:mt-8 mt-4 group">
      <div 
        className="flex transition-transform duration-700 ease-in-out" 
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {banners.map((banner, index) => (
          <div 
            key={banner.id} 
            className="w-full shrink-0 relative flex items-center justify-center overflow-hidden transition-all duration-500"
            style={{ 
              width: banner.width && banner.width !== "" ? banner.width : "100%",
              height: banner.height && banner.height !== "" ? banner.height : "400px",
              backgroundColor: banner.bgColor || "transparent"
            }}
          >
            {/* Background Patterns */}
            {banner.bgPattern === "grid" && (
              <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
            )}
            {banner.bgPattern === "dots" && (
              <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)', backgroundSize: '15px 15px' }} />
            )}
            {banner.bgPattern === "waves" && (
              <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'20\' viewBox=\'0 0 100 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M21.184 20c.357-.13.72-.264 1.088-.402l1.768-.661C33.64 15.347 39.647 14 50 14c10.271 0 15.362 1.222 24.629 4.928.955.383 1.869.74 2.75 1.072h6.225c-2.51-.73-5.139-1.691-8.233-2.928C65.888 13.278 60.562 12 50 12c-10.626 0-16.855 1.397-26.66 5.063l-1.767.662c-2.475.923-4.66 1.674-6.724 2.275h6.335zm0-20c.357.13.72.264 1.088.402l1.768.661C33.64 4.653 39.647 6 50 6c10.271 0 15.362-1.222 24.629-4.928C75.584.689 76.498.331 77.379 0h-6.225c-2.51.73-5.139 1.691-8.233 2.928C62.888 6.722 57.562 8 50 8c-10.626 0-16.855-1.397-26.66-5.063l-1.767-.662C19.098 1.352 16.913.601 14.849 0h6.335z\' fill=\'currentColor\' fill-opacity=\'1\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")', backgroundRepeat: 'repeat' }} />
            )}

            {banner.title ? (
              <div className="flex flex-col md:flex-row items-center justify-between w-full h-full px-8 md:px-16 lg:px-24 py-12 relative z-10">
                <div className="flex-1 text-left space-y-4 md:space-y-6 max-w-xl animate-in fade-in slide-in-from-left-8 duration-700">
                  <h2 className="text-4xl md:text-5xl lg:text-7xl font-black tracking-tight leading-[1.1] text-foreground">
                    {banner.title.split(' ').map((word: string, i: number) => (
                      <span key={i} className={i % 2 === 0 ? "text-primary" : ""}>
                        {word}{' '}
                      </span>
                    ))}
                  </h2>
                  <p className="text-lg md:text-xl text-muted-foreground font-medium max-w-md">
                    {banner.subtext}
                  </p>
                  <div className="pt-4">
                    {banner.link ? (
                      <Link 
                        href={banner.link} 
                        target="_blank"
                        className="inline-flex items-center justify-center px-8 py-4 bg-primary text-white font-bold rounded-full text-lg shadow-xl hover:shadow-primary/20 hover:scale-105 active:scale-95 transition-all duration-300 uppercase tracking-wider"
                      >
                        {banner.buttonText || "Batafsil"}
                      </Link>
                    ) : (
                      <button className="px-8 py-4 bg-primary text-white font-bold rounded-full text-lg shadow-xl cursor-default uppercase tracking-wider">
                        {banner.buttonText || "Batafsil"}
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex-1 flex justify-center items-center h-full relative mt-8 md:mt-0 animate-in fade-in slide-in-from-right-8 duration-700 delay-200">
                  <div className="relative w-full aspect-square max-w-[400px] group">
                    <div className="absolute inset-0 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-colors duration-500" />
                    <Image
                      src={banner.imageUrl}
                      alt={banner.title}
                      fill
                      className="object-contain relative z-10 drop-shadow-2xl transition-transform duration-500 group-hover:scale-105"
                      priority={index === 0}
                    />
                  </div>
                </div>
              </div>
            ) : (
              // Simple Image Layout
              banner.link ? (
                <Link href={banner.link} target="_blank" className="relative block w-full h-full">
                  <Image
                    src={banner.imageUrl}
                    alt={`Banner ${index + 1}`}
                    fill
                    className="object-contain cursor-pointer hover:opacity-95 transition-transform hover:scale-[1.01]"
                    priority={index === 0}
                  />
                </Link>
              ) : (
                <div className="relative w-full h-full">
                  <Image
                    src={banner.imageUrl}
                    alt={`Banner ${index + 1}`}
                    fill
                    className="object-contain"
                    priority={index === 0}
                  />
                </div>
              )
            )}
          </div>
        ))}
      </div>

      {banners.length > 1 && (
        <>
          <button 
            onClick={goToPrev}
            className="absolute top-1/2 left-4 -translate-y-1/2 w-10 h-10 bg-background/60 backdrop-blur-md rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background/90 shadow-lg text-foreground border border-border/50"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <button 
            onClick={goToNext}
            className="absolute top-1/2 right-4 -translate-y-1/2 w-10 h-10 bg-background/60 backdrop-blur-md rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background/90 shadow-lg text-foreground border border-border/50"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
            {banners.map((_, i) => (
              <div 
                key={i} 
                className={`w-2 h-2 rounded-full transition-all duration-300 ${i === currentIndex ? "w-6 bg-primary" : "bg-foreground/30"}`}
                onClick={() => setCurrentIndex(i)}
                style={{ cursor: 'pointer' }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
