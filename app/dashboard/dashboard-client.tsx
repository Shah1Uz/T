"use client";

import ListingCard from "@/components/listing-card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusSquare, BarChart2, Eye, Phone, TrendingUp, Edit3, Map as MapIcon, ChevronDown, ChevronUp } from "lucide-react";
import { useLocale } from "@/context/locale-context";
import AnalyticsHeatmap from "@/components/analytics-heatmap";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Stats {
  listings: number;
  views: number;
  calls: number;
  sales: number;
}

interface DashboardClientProps {
  listings: any[];
  stats: Stats;
  user: any;
}

export default function DashboardClient({ listings, stats, user }: DashboardClientProps) {
  const { t, locale } = useLocale();
  const [expandedListing, setExpandedListing] = useState<string | null>(null);

  const statCards = [
    {
      icon: BarChart2,
      label: locale === "uz" ? "E'lonlar" : "Объявления",
      value: stats.listings,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
    },
    {
      icon: Eye,
      label: locale === "uz" ? "Ko'rishlar" : "Просмотры",
      value: stats.views,
      color: "text-violet-500",
      bg: "bg-violet-500/10",
      border: "border-violet-500/20",
    },
    {
      icon: Phone,
      label: locale === "uz" ? "Qo'ng'iroqlar" : "Звонки",
      value: stats.calls,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
    },
    {
      icon: TrendingUp,
      label: locale === "uz" ? "Sotuvlar" : "Продажи",
      value: stats.sales,
      color: "text-orange-500",
      bg: "bg-orange-500/10",
      border: "border-orange-500/20",
    },
  ];

  return (
    <div className="container py-8 md:py-10 max-w-6xl">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-bold">{t("dashboard.title")}</h1>
            {user?.plan && user.plan !== "FREE" && (
              <Badge 
                className={cn(
                  "px-2.5 py-0.5 text-[10px] font-black tracking-widest uppercase rounded-full shadow-sm",
                  user.plan === "VIP" ? "bg-amber-500 hover:bg-amber-600 border-none text-white shadow-amber-500/20" : 
                  user.plan === "EKONOM" ? "bg-blue-500 hover:bg-blue-600 border-none text-white shadow-blue-500/20" : ""
                )}
              >
                {user.plan}
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground text-sm mt-1">{t("dashboard.subtitle")}</p>
        </div>
        <Button asChild className="shrink-0 w-full sm:w-auto rounded-xl">
          <Link href="/listings/create" className="flex items-center text-white">
            <PlusSquare className="mr-2 h-4 w-4 shrink-0 text-white" />
            <span className="text-white">{t("dashboard.new_listing")}</span>
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {statCards.map((card, i) => (
          <div
            key={i}
            className={`rounded-2xl border ${card.border} ${card.bg} p-5 flex flex-col gap-3 hover:scale-[1.02] transition-transform duration-200`}
          >
            <div className={`h-10 w-10 rounded-xl ${card.bg} border ${card.border} flex items-center justify-center`}>
              <card.icon className={`h-5 w-5 ${card.color}`} />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{card.label}</p>
              <p className={`text-3xl font-black mt-0.5 ${card.color}`}>
                {card.value.toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Listings */}
      {listings.length > 0 ? (
        <div className="flex flex-col gap-6">
          {listings.map((listing) => (
            <div key={listing.id} className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                   <ListingCard listing={listing} />
                </div>
                <div className="flex flex-row md:flex-col gap-2 shrink-0">
                  <Button asChild variant="outline" className="flex-1 md:w-32 rounded-xl border-2 font-bold hover:bg-muted/50">
                    <Link href={`/listings/${listing.id}/edit`}>
                      <Edit3 className="h-4 w-4 mr-2" />
                      {locale === "uz" ? "Tahrirlash" : "Изм."}
                    </Link>
                  </Button>
                  <Button 
                    variant="secondary" 
                    className="flex-1 md:w-32 rounded-xl font-bold bg-muted/50 hover:bg-muted"
                    onClick={() => setExpandedListing(expandedListing === listing.id ? null : listing.id)}
                  >
                    {expandedListing === listing.id ? <ChevronUp className="h-4 w-4 mr-2" /> : <ChevronDown className="h-4 w-4 mr-2" />}
                    {locale === "uz" ? "Analitika" : "Анал."}
                  </Button>
                </div>
              </div>
              
              {expandedListing === listing.id && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <AnalyticsHeatmap listingId={listing.id} />
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 px-4 bg-muted/30 rounded-2xl border border-dashed text-center">
          <div className="h-20 w-20 bg-muted rounded-full flex items-center justify-center mb-6">
            <PlusSquare className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="text-2xl font-bold mb-2">{t("dashboard.no_listings")}</h3>
          <p className="text-muted-foreground text-lg mb-8 max-w-md">{t("dashboard.no_listings_desc")}</p>
          <Button size="lg" className="rounded-xl px-8 font-bold" asChild>
            <Link href="/listings/create" className="flex items-center text-white">
              <PlusSquare className="mr-2 h-5 w-5 text-white" />
              <span className="text-white">{t("dashboard.create_now")}</span>
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
