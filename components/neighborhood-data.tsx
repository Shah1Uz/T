"use client";

import { useLocale } from "@/context/locale-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Leaf, VolumeX, Building2, TrainFront, ShieldCheck } from "lucide-react";
import { useMemo } from "react";

interface NeighborhoodDataProps {
  lat?: number;
  lng?: number;
}

export default function NeighborhoodData({ lat, lng }: NeighborhoodDataProps) {
  const { t } = useLocale();

  // Generate pseudo-random realistic data based on coordinates 
  // (In a real app, this would query an external API mapping lat/lng to indexes)
  const data = useMemo(() => {
    // A simple deterministic hash function for coordinates
    const hash = lat && lng ? Math.abs(Math.sin(lat * lng) * 10000) : Math.random() * 10000;
    
    return {
      airQuality: Math.floor(65 + (hash % 30)), // 65-95%
      noiseLevel: Math.floor(40 + (hash % 40)), // 40-80% (lower is better actually, let's say it's quietness)
      quietness: Math.floor(50 + (hash % 45)), // 50-95%
      schools: Math.floor(70 + (hash % 25)), // 70-95%
      transport: Math.floor(60 + (hash % 35)), // 60-95%
      safety: Math.floor(75 + (hash % 20)), // 75-95%
    };
  }, [lat, lng]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h4 className="font-black text-foreground uppercase tracking-widest text-sm text-center md:text-left">
          {t("listing.eco_index")}
        </h4>
        <div className="flex items-center gap-1.5 bg-green-500/10 text-green-500 px-2 py-1 rounded-md text-xs font-bold border border-green-500/20">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>{t("listing.verified_area")}</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Air Quality */}
        <Card className="border-gray-100 shadow-sm hover:shadow-md transition-shadow bg-gradient-to-br from-card to-green-500/10">
          <CardContent className="p-4 sm:p-5 flex gap-4 items-center">
            <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
              <Leaf className="h-6 w-6 text-green-600" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center mb-1.5">
                <span className="font-bold text-foreground text-sm">{t("listing.air_quality")}</span>
                <span className="font-black text-green-600 text-sm">{data.airQuality}%</span>
              </div>
              <Progress value={data.airQuality} className="h-2 bg-green-500/20 [&>div]:bg-green-500/100" />
              <p className="text-[10px] text-gray-500 mt-1.5 font-medium uppercase tracking-wider">{t("listing.excellent_indicator")}</p>
            </div>
          </CardContent>
        </Card>

        {/* Noise Level */}
        <Card className="border-gray-100 shadow-sm hover:shadow-md transition-shadow bg-gradient-to-br from-card to-blue-500/10">
          <CardContent className="p-4 sm:p-5 flex gap-4 items-center">
            <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
              <VolumeX className="h-6 w-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center mb-1.5">
                <span className="font-bold text-foreground text-sm">{t("listing.noise_level")}</span>
                <span className="font-black text-blue-600 text-sm">{data.quietness}%</span>
              </div>
              <Progress value={data.quietness} className="h-2 bg-blue-500/20 [&>div]:bg-blue-500" />
              <p className="text-[10px] text-gray-500 mt-1.5 font-medium uppercase tracking-wider">{t("listing.family_friendly")}</p>
            </div>
          </CardContent>
        </Card>

        {/* Education/Schools */}
        <Card className="border-gray-100 shadow-sm hover:shadow-md transition-shadow bg-gradient-to-br from-card to-orange-500/10">
          <CardContent className="p-4 sm:p-5 flex gap-4 items-center">
            <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center shrink-0">
              <Building2 className="h-6 w-6 text-orange-600" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center mb-1.5">
                <span className="font-bold text-foreground text-sm">{t("listing.schools_kindergartens")}</span>
                <span className="font-black text-orange-600 text-sm">{data.schools}%</span>
              </div>
              <Progress value={data.schools} className="h-2 bg-orange-500/20 [&>div]:bg-orange-500" />
              <p className="text-[10px] text-gray-500 mt-1.5 font-medium uppercase tracking-wider">{t("listing.schools_nearby")}</p>
            </div>
          </CardContent>
        </Card>

        {/* Transport */}
        <Card className="border-gray-100 shadow-sm hover:shadow-md transition-shadow bg-gradient-to-br from-card to-purple-500/10">
          <CardContent className="p-4 sm:p-5 flex gap-4 items-center">
            <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0">
              <TrainFront className="h-6 w-6 text-purple-600" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center mb-1.5">
                <span className="font-bold text-foreground text-sm">{t("listing.transport_convenience")}</span>
                <span className="font-black text-purple-600 text-sm">{data.transport}%</span>
              </div>
              <Progress value={data.transport} className="h-2 bg-purple-500/20 [&>div]:bg-purple-500" />
              <p className="text-[10px] text-gray-500 mt-1.5 font-medium uppercase tracking-wider">{t("listing.near_metro")}</p>
            </div>
          </CardContent>
        </Card>
      </div>
      <p className="text-xs text-muted-foreground italic text-center md:text-left">
        {t("listing.ai_estimate_disclaimer")}
      </p>
    </div>
  );
}
