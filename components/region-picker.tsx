"use client";

import { useState, useEffect } from "react";
import { MapPin, ChevronRight, Search, X, Check } from "lucide-react";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useLocale } from "@/context/locale-context";

const REGIONS = [
  { id: "tashkent", uz: "Toshkent shahri", ru: "Город Ташкент" },
  { id: "tashkent_v", uz: "Toshkent viloyati", ru: "Ташкентская область" },
  { id: "andijan", uz: "Andijon viloyati", ru: "Андижанская область" },
  { id: "bukhara", uz: "Buxoro viloyati", ru: "Бухарская область" },
  { id: "fergana", uz: "Farg‘ona viloyati", ru: "Ферганская область" },
  { id: "jizzakh", uz: "Jizzax viloyati", ru: "Джизакская область" },
  { id: "khorezm", uz: "Xorazm viloyati", ru: "Хорезмская область" },
  { id: "namangan", uz: "Namangan viloyati", ru: "Наманганская область" },
  { id: "navoiy", uz: "Navoiy viloyati", ru: "Навоийская область" },
  { id: "qashqadaryo", uz: "Qashqadaryo viloyati", ru: "Кашкадарьинская область" },
  { id: "samarkand", uz: "Samarqand viloyati", ru: "Самаркандская область" },
  { id: "sirdaryo", uz: "Sirdaryo viloyati", ru: "Сырдарьинская область" },
  { id: "surxondaryo", uz: "Surxondaryo viloyati", ru: "Сурхандарьинская область" },
  { id: "karakalpakstan", uz: "Qoraqalpogʻiston", ru: "Каракалпакстан" },
];

interface RegionPickerProps {
  onSelect: (region: string) => void;
  currentValue?: string;
  className?: string;
}

export default function RegionPicker({ onSelect, currentValue, className }: RegionPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { locale, t } = useLocale();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const filteredRegions = REGIONS.filter(r => 
    (locale === "uz" ? r.uz : r.ru).toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (region: typeof REGIONS[0]) => {
    const name = locale === "uz" ? region.uz : region.ru;
    onSelect(name);
    setOpen(false);
  };

  const Trigger = (
    <div 
      className={cn(
        "flex flex-col cursor-pointer group transition-all",
        className
      )}
      onClick={() => setOpen(true)}
    >
      <span className="text-[10px] 3xl:text-lg font-black text-slate-900 dark:text-white uppercase tracking-widest opacity-60 group-hover:opacity-100 transition-opacity">
        {locale === "uz" ? "Joylashuv" : "Место"}
      </span>
      <span className="text-slate-700 dark:text-slate-300 font-bold text-[14px] 3xl:text-2xl truncate group-hover:text-primary transition-colors">
        {currentValue || (locale === "uz" ? "Qayerga?" : "Куда?")}
      </span>
    </div>
  );

  if (isMobile) {
    return (
      <>
        {Trigger}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-md flex items-end justify-center"
              onClick={() => setOpen(false)}
            >
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="w-full max-w-lg bg-white dark:bg-slate-950 rounded-t-[32px] overflow-hidden flex flex-col max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-4 border-b dark:border-white/10 flex items-center justify-between">
                  <h3 className="text-xl font-black tracking-tight">{locale === "uz" ? "Viloyatni tanlang" : "Выберите регион"}</h3>
                  <button 
                    onClick={() => setOpen(false)}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-colors"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="p-4">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                      autoFocus
                      type="text"
                      placeholder={locale === "uz" ? "Qidirish..." : "Поиск..."}
                      className="w-full h-14 pl-12 pr-4 bg-slate-100 dark:bg-white/5 rounded-2xl border-none outline-none text-lg font-medium"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                </div>

                <div className="overflow-y-auto pb-8 px-2">
                  <div className="grid grid-cols-1 gap-1">
                    {filteredRegions.map((region) => (
                      <button
                        key={region.id}
                        onClick={() => handleSelect(region)}
                        className={cn(
                          "flex items-center justify-between p-4 rounded-2xl transition-all active:scale-[0.98]",
                          currentValue === (locale === "uz" ? region.uz : region.ru)
                            ? "bg-primary/10 text-primary border border-primary/20"
                            : "hover:bg-slate-50 dark:hover:bg-white/5"
                        )}
                      >
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "h-10 w-10 rounded-xl flex items-center justify-center transition-colors",
                            currentValue === (locale === "uz" ? region.uz : region.ru)
                              ? "bg-primary text-white"
                              : "bg-slate-100 dark:bg-white/10 text-slate-500"
                          )}>
                            <MapPin className="h-5 w-5" />
                          </div>
                          <span className="text-lg font-bold">{locale === "uz" ? region.uz : region.ru}</span>
                        </div>
                        {currentValue === (locale === "uz" ? region.uz : region.ru) && <Check className="h-6 w-6" />}
                      </button>
                    ))}
                    {filteredRegions.length === 0 && (
                      <div className="py-12 text-center text-slate-500 font-medium">
                        {locale === "uz" ? "Hech narsa topilmadi" : "Ничего не найдено"}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {Trigger}
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[400px] p-0 rounded-[24px] shadow-2xl border-white/10 backdrop-blur-2xl bg-white/95 dark:bg-slate-950/95 overflow-hidden">
        <div className="p-4 border-b dark:border-white/10">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              autoFocus
              type="text"
              placeholder={locale === "uz" ? "Qidirish..." : "Поиск..."}
              className="w-full h-10 pl-10 pr-4 bg-slate-100 dark:bg-white/5 rounded-xl border-none outline-none text-sm font-medium"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="max-h-[400px] overflow-y-auto p-2 scrollbar-hide">
          <div className="grid grid-cols-1 gap-1">
            {filteredRegions.map((region) => (
              <button
                key={region.id}
                onClick={() => handleSelect(region)}
                className={cn(
                  "flex items-center justify-between p-3 rounded-xl transition-all group",
                  currentValue === (locale === "uz" ? region.uz : region.ru)
                    ? "bg-primary text-white"
                    : "hover:bg-primary/5 hover:text-primary"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "h-8 w-8 rounded-lg flex items-center justify-center transition-colors",
                    currentValue === (locale === "uz" ? region.uz : region.ru)
                      ? "bg-white/20"
                      : "bg-slate-100 dark:bg-white/10 text-slate-500 group-hover:text-primary"
                  )}>
                    <MapPin className="h-4 w-4" />
                  </div>
                  <span className="font-bold">{locale === "uz" ? region.uz : region.ru}</span>
                </div>
                <ChevronRight className={cn(
                  "h-4 w-4 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1",
                  currentValue === (locale === "uz" ? region.uz : region.ru) && "opacity-100"
                )} />
              </button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
