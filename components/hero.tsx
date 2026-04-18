"use client";

import { useLocale } from "@/context/locale-context";
import { Search, MapPin, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import RegionPicker from "@/components/region-picker";

export default function Hero() {
  const { t, locale } = useLocale();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSearch = () => {
    let url = `/search?`;
    if (query.trim()) url += `q=${encodeURIComponent(query)}&`;
    if (selectedRegion) url += `region=${encodeURIComponent(selectedRegion)}`;
    
    router.push(url);
    document.getElementById("listings-section")?.scrollIntoView({ behavior: "smooth" });
  };

  const stats = [
    { value: "12,400+", uz: "E'lonlar", ru: "Объявлений" },
    { value: "340+",    uz: "Quruvchilar", ru: "Застройщиков" },
    { value: "14",      uz: "Viloyatlar", ru: "Регионов" },
  ];

  return (
    <section className="relative overflow-hidden bg-slate-950 text-white rounded-[40px] md:rounded-[60px] lg:rounded-[80px]">
      {/* Layered background glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_20%_-10%,rgba(61,90,254,0.22),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_80%_110%,rgba(99,130,255,0.14),transparent)]" />
        {/* Dot grid */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="dots" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
              <circle cx="1.5" cy="1.5" r="1.5" fill="white" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots)" />
        </svg>
      </div>

      <div className="container relative z-10 pt-20 pb-28 md:pt-28 md:pb-36">
        {/* Badge */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center gap-2 bg-white/8 border border-white/12 rounded-full px-4 py-2 text-[13px] font-semibold text-blue-200 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
            {t("hero.category")}: {t("hero.tashkent")}
          </div>
        </div>

        {/* Headline */}
        <div className="text-center max-w-4xl 3xl:max-w-7xl mx-auto mb-12 3xl:mb-20">
          <h1 className="text-[42px] sm:text-[56px] md:text-[72px] 3xl:text-[100px] 4xl:text-[140px] font-black leading-[1.05] tracking-tight mb-6 3xl:mb-10">
            {t("hero.title")}
            <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-violet-400">
              {" "}UY SELL
            </span>

          </h1>
          <p className="text-slate-300 text-lg md:text-xl 3xl:text-3xl max-w-xl 3xl:max-w-3xl mx-auto leading-relaxed font-medium">
            {t("hero.subtitle")}
          </p>
        </div>

        {/* Search Bar */}
        <div id="tour-hero-search" className="max-w-3xl 3xl:max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row gap-0 bg-white dark:bg-slate-900 border border-black/10 dark:border-white/10 rounded-[32px] sm:rounded-full p-2 shadow-[0_20px_50px_rgba(0,0,0,0.3)] ring-1 ring-black/5 backdrop-blur-xl">
            <div className="flex-1 flex items-center gap-3 px-6 3xl:px-12 py-3 3xl:py-6 hover:bg-slate-50 dark:hover:bg-white/5 transition-all rounded-t-[28px] sm:rounded-l-full sm:rounded-t-none group">
              <div className="flex flex-col w-full">
                <span className="text-[10px] 3xl:text-lg font-black text-slate-900 dark:text-white uppercase tracking-widest opacity-60 group-hover:opacity-100 transition-opacity">{t("hero.category")}</span>
                <input
                  type="text"
                  placeholder={t("hero.search")}
                  className="w-full bg-transparent border-none outline-none text-slate-700 dark:text-slate-200 font-bold placeholder:text-slate-400 text-[14px] 3xl:text-2xl"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
            </div>
            
            <div className="hidden sm:block h-10 3xl:h-20 w-px bg-slate-200 dark:bg-white/10 self-center" />

            <div className="flex-1 flex flex-col justify-center px-6 3xl:px-12 py-3 3xl:py-6 hover:bg-slate-50 dark:hover:bg-white/5 transition-all sm:rounded-none group border-t sm:border-t-0 dark:border-white/10">
              <RegionPicker 
                currentValue={selectedRegion}
                onSelect={setSelectedRegion}
              />
            </div>

            <div className="flex items-center p-1 border-t sm:border-t-0 dark:border-white/10 pt-4 sm:pt-1">
              <Button
                size="lg"
                onClick={handleSearch}
                className="h-14 sm:h-12 3xl:h-20 w-full sm:w-auto px-10 3xl:px-20 rounded-2xl sm:rounded-full font-black text-[16px] 3xl:text-2xl bg-[#FF385C] hover:bg-[#E31C5F] text-white shadow-[0_10px_20px_rgba(255,56,92,0.3)] transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
              >
                <Search className="h-5 w-5 3xl:h-8 3xl:w-8" />
                <span>{t("hero.search").replace("...", "")}</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap justify-center gap-12 3xl:gap-24 mt-16 3xl:mt-32">
          {mounted && stats.map((s, i) => (
            <div key={i} className="text-center">
              <div className="text-2xl 3xl:text-5xl font-black text-white tabular-nums">{s.value}</div>
              <div className="text-slate-400 3xl:text-xl text-sm font-medium mt-1 3xl:mt-3">{locale === "ru" ? s.ru : s.uz}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
