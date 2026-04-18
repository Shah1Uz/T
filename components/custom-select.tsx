"use client";

import { useState, useEffect } from "react";
import { ChevronDown, Check, X, Search } from "lucide-react";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useLocale } from "@/context/locale-context";

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
  searchable?: boolean;
}

export default function CustomSelect({ 
  options, 
  value, 
  onChange, 
  label, 
  placeholder, 
  className,
  searchable = false
}: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { locale } = useLocale();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);

    // Scroll lock when open
    if (open && isMobile) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      window.removeEventListener("resize", checkMobile);
      document.body.style.overflow = "unset";
    };
  }, [open, isMobile]);

  const selectedOption = options.find(opt => opt.value === value);
  const filteredOptions = searchable 
    ? options.filter(opt => opt.label.toLowerCase().includes(search.toLowerCase()))
    : options;

  const handleSelect = (val: string) => {
    onChange(val);
    setOpen(false);
  };

  const Trigger = (
    <div className="space-y-2 w-full">
      {label && <label className="text-sm font-semibold text-foreground/70 ml-1">{label}</label>}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "w-full h-12 px-4 rounded-xl border-2 border-border bg-background flex items-center justify-between transition-all hover:border-primary/50 group",
          open && "border-primary ring-2 ring-primary/10",
          className
        )}
      >
        <span className={cn(
          "font-bold text-base truncate",
          !selectedOption && "text-muted-foreground font-medium"
        )}>
          {selectedOption ? selectedOption.label : placeholder || (locale === "uz" ? "Tanlang" : "Выберите")}
        </span>
        <ChevronDown className={cn(
          "h-5 w-5 text-muted-foreground transition-transform duration-300",
          open && "rotate-180 text-primary"
        )} />
      </button>
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
                className="w-full bg-white dark:bg-slate-950 rounded-t-[32px] overflow-hidden flex flex-col max-h-[80vh]"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-4 border-b dark:border-white/10 flex items-center justify-between">
                  <h3 className="text-xl font-black tracking-tight">{label || (locale === "uz" ? "Tanlang" : "Выберите")}</h3>
                  <button 
                    type="button"
                    onClick={() => setOpen(false)}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-colors"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                {searchable && (
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
                )}

                <div className="overflow-y-auto pb-10 px-2 pt-2">
                  <div className="grid grid-cols-1 gap-1">
                    {filteredOptions.map((opt) => (
                      <button
                        type="button"
                        key={opt.value}
                        onClick={() => handleSelect(opt.value)}
                        className={cn(
                          "flex items-center justify-between p-4 rounded-2xl transition-all active:scale-[0.98]",
                          value === opt.value
                            ? "bg-primary text-white"
                            : "hover:bg-slate-50 dark:hover:bg-white/5"
                        )}
                      >
                        <span className="text-lg font-bold">{opt.label}</span>
                        {value === opt.value && <Check className="h-6 w-6" />}
                      </button>
                    ))}
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
      <PopoverContent align="start" className="w-[300px] p-2 rounded-2xl shadow-2xl border-white/10 backdrop-blur-2xl bg-white dark:bg-slate-950 overflow-hidden">
        {searchable && (
          <div className="p-2 border-b dark:border-white/10 mb-1">
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
        )}
        <div className="max-h-[300px] overflow-y-auto scrollbar-hide py-1">
          {filteredOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleSelect(opt.value)}
              className={cn(
                "w-full flex items-center justify-between p-3 rounded-xl transition-all group",
                value === opt.value
                  ? "bg-primary text-white"
                  : "hover:bg-primary/5 hover:text-primary"
              )}
            >
              <span className="font-bold">{opt.label}</span>
              {value === opt.value && <Check className="h-4 w-4" />}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
