"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Map as MapIcon, Users, ArrowUpRight } from "lucide-react";
import { useLocale } from "@/context/locale-context";

interface AnalyticsData {
  region: string;
  count: number;
}

export default function AnalyticsHeatmap({ listingId }: { listingId: string }) {
  const { locale } = useLocale();
  const [data, setData] = useState<AnalyticsData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/listings/${listingId}/analytics`)
      .then(res => res.json())
      .then(data => {
        setData(data);
        setLoading(false);
      });
  }, [listingId]);

  if (loading) return (
    <div className="h-[300px] flex items-center justify-center bg-muted/20 rounded-[32px] animate-pulse">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
    </div>
  );

  const totalViews = data.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <Card className="border-none shadow-xl rounded-[32px] overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-black flex items-center gap-2">
            <MapIcon className="h-5 w-5 text-primary" />
            {locale === "uz" ? "Qiziqish xaritasi" : "Карта интереса"}
          </CardTitle>
          <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase">
            {totalViews} {locale === "uz" ? "jami ko'rilgan" : "всего просмотров"}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 pt-4">
        <div className="space-y-4">
          {data.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground font-bold italic">
              {locale === "uz" ? "Hozircha ma'lumotlar yo'q" : "Данных пока нет"}
            </div>
          ) : (
            data.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between text-sm font-bold">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-muted flex items-center justify-center text-[10px]">{index + 1}</span>
                    {item.region}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-primary">{item.count}</span>
                    <span className="text-muted-foreground text-[10px] uppercase">({((item.count / totalViews) * 100).toFixed(1)}%)</span>
                  </div>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-1000"
                    style={{ width: `${(item.count / totalViews) * 100}%` }}
                  />
                </div>
              </div>
            ))
          )}
        </div>

        {data.length > 0 && (
          <div className="pt-4 border-t flex items-center justify-between text-xs font-bold text-muted-foreground uppercase tracking-widest">
            <div className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" />
              {locale === "uz" ? "Viloyatlar bo'yicha" : "По регионам"}
            </div>
            <div className="flex items-center gap-1 text-primary">
              Live <div className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
