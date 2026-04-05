"use client";

import { useEffect, useState } from "react";
import { useLocale } from "@/context/locale-context";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, LayoutGrid, Star, ArrowRight } from "lucide-react";
import VerifiedBadge from "@/components/verified-badge";
import StarRating from "@/components/star-rating";

export default function TopSellersPage() {
  const { t, locale } = useLocale();
  const [sellers, setSellers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/users/top")
      .then(res => res.json())
      .then(data => {
        setSellers(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="container py-20 text-center">
      <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mx-auto" />
      <p className="mt-4 font-bold text-muted-foreground uppercase">{t("common.loading")}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Premium Header */}
      <div className="relative py-20 bg-gradient-to-br from-primary/10 via-background to-transparent border-b border-border">
        <div className="container text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-amber-500/10 text-amber-500 px-4 py-2 rounded-2xl border border-amber-500/20 font-black uppercase tracking-widest text-xs">
            <Trophy className="h-4 w-4" />
            {locale === "uz" ? "Top Sotuvchilar" : "Топ Продавцов"}
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-foreground tracking-tighter">
            {locale === "uz" ? "UySell'ning Eng Faol Agentlari" : "Самые активные агенты UySell"}
          </h1>
          <p className="max-w-2xl mx-auto text-muted-foreground font-bold text-lg leading-relaxed">
            {locale === "uz" 
              ? "Eng ko'p e'lon joylagan va yuqori reytingli sotuvchilar bilan tanishing." 
              : "Познакомьтесь с продавцами, которые разместили больше всего объявлений и имеют высокий рейтинг."}
          </p>
        </div>
      </div>

      <div className="container py-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {sellers.map((seller, index) => (
            <Link key={seller.id} href={`/profile/${seller.id}`}>
              <Card className="group relative border border-border/40 bg-card/40 backdrop-blur-md hover:bg-card hover:border-primary/30 transition-all duration-300 rounded-[24px] shadow-sm hover:shadow-xl overflow-hidden h-full">
                
                {/* Rank Badge - More Subtle */}
                <div className={`absolute top-3 left-3 h-7 w-7 rounded-lg flex items-center justify-center font-black text-xs z-10 shadow-sm ${
                  index === 0 ? "bg-amber-400 text-amber-950" : 
                  index === 1 ? "bg-slate-300 text-slate-800" :
                  index === 2 ? "bg-orange-400 text-orange-950" :
                  "bg-muted text-muted-foreground"
                }`}>
                  {index + 1}
                </div>

                <CardContent className="p-4 pt-8">
                  <div className="flex flex-col items-center text-center">
                    <div className="relative h-16 w-16 rounded-2xl overflow-hidden border-2 border-background shadow-md mb-3 group-hover:scale-105 transition-transform duration-300">
                      <Image 
                        src={seller.imageUrl || "/placeholder-user.jpg"} 
                        fill 
                        alt={seller.name || "Sotuvchi"} 
                        className="object-cover"
                      />
                    </div>
                    
                    <div className="space-y-0.5 mb-3 w-full">
                      <h2 className="text-sm font-bold text-foreground flex items-center justify-center gap-1 truncate px-1">
                        {seller.name || "Sotuvchi"}
                        {seller.isVerified && <VerifiedBadge iconClassName="w-3.5 h-3.5" />}
                      </h2>
                      <div className="flex items-center justify-center gap-1">
                         <StarRating rating={seller.avgRating} size={10} />
                         <span className="text-[10px] font-bold text-amber-500">({seller.reviewsCount})</span>
                      </div>
                    </div>

                    <div className="w-full grid grid-cols-2 gap-2 pt-3 border-t border-border/50">
                       <div className="bg-primary/5 rounded-xl p-1.5 border border-primary/10">
                          <p className="text-[8px] font-black text-muted-foreground uppercase tracking-wider mb-0.5">{locale === "uz" ? "E'lonlar" : "Объявления"}</p>
                          <div className="flex items-center justify-center gap-1 text-primary">
                             <LayoutGrid className="h-3 w-3" />
                             <span className="text-xs font-black">{seller.listingCount}</span>
                          </div>
                       </div>
                       <div className="bg-blue-500/5 rounded-xl p-1.5 border border-blue-500/10">
                          <p className="text-[8px] font-black text-muted-foreground uppercase tracking-wider mb-0.5">{locale === "uz" ? "Reyting" : "Рейтинг"}</p>
                          <div className="flex items-center justify-center gap-1 text-blue-500">
                             <Star className="h-3 w-3 fill-current" />
                             <span className="text-xs font-black">{seller.avgRating.toFixed(1)}</span>
                          </div>
                       </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
