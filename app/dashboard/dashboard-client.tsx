"use client";

import ListingCard from "@/components/listing-card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { 
  PlusSquare, 
  BarChart2, 
  Eye, 
  Phone, 
  TrendingUp, 
  Edit3, 
  ChevronDown, 
  ChevronUp,
  Plus,
  LayoutDashboard,
  History,
  Settings,
  ExternalLink,
  Sparkles,
  ArrowRight
} from "lucide-react";
import { useLocale } from "@/context/locale-context";
import AnalyticsHeatmap from "@/components/analytics-heatmap";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";

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
      icon: LayoutDashboard,
      label: locale === "uz" ? "E'lonlar" : "Объявления",
      value: stats.listings,
      color: "text-blue-600",
      bg: "bg-blue-600/5",
      border: "border-blue-600/20",
      description: locale === "uz" ? "Jami joylanganlar" : "Всего размещено"
    },
    {
      icon: Eye,
      label: locale === "uz" ? "Ko'rishlar" : "Просмотры",
      value: stats.views,
      color: "text-purple-600",
      bg: "bg-purple-600/5",
      border: "border-purple-600/20",
      description: locale === "uz" ? "Umumiy trafik" : "Общий трафик"
    },
    {
      icon: Phone,
      label: locale === "uz" ? "Qo'ng'iroqlar" : "Звонки",
      value: stats.calls,
      color: "text-emerald-600",
      bg: "bg-emerald-600/5",
      border: "border-emerald-600/20",
      description: locale === "uz" ? "To'g'ridan-to'g'ri bog'lanish" : "Прямые контакты"
    },
    {
      icon: TrendingUp,
      label: locale === "uz" ? "Sotuvlar" : "Продажи",
      value: stats.sales,
      color: "text-orange-600",
      bg: "bg-orange-600/5",
      border: "border-orange-600/20",
      description: locale === "uz" ? "Sotilgan ob'ektlar" : "Проданные объекты"
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 pb-20">
      {/* Header Section */}
      <div className="bg-white dark:bg-slate-900 border-b border-border/50 pb-8 pt-12 md:pb-12 md:pt-16">
        <div className="container max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-1 bg-primary rounded-full" />
                <h1 className="text-3xl md:text-4xl font-black tracking-tight text-foreground uppercase">
                  {t("dashboard.title")}
                </h1>
                {user?.plan && user.plan !== "FREE" && (
                  <Badge className="bg-amber-500 hover:bg-amber-600 text-white font-black px-3 py-1 rounded-full text-[10px] uppercase tracking-widest border-none shadow-lg shadow-amber-500/20">
                    <Sparkles className="w-2.5 h-2.5 mr-1" />
                    {user.plan}
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground font-medium text-lg max-w-2xl">
                {t("dashboard.subtitle")}
              </p>
            </div>
            
            <div className="flex flex-wrap gap-3 w-full md:w-auto">
              <Button asChild className="h-14 px-8 rounded-2xl bg-primary text-primary-foreground font-black uppercase text-xs tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex-1 md:flex-none">
                <Link href="/listings/create" className="flex items-center justify-center">
                  <Plus className="mr-2 h-5 w-5" />
                  {t("dashboard.new_listing")}
                </Link>
              </Button>
              <Button variant="outline" asChild className="h-14 px-6 rounded-2xl border-2 font-black uppercase text-[10px] tracking-widest hover:bg-muted/50 hidden md:flex">
                <Link href="/pricing" className="flex items-center">
                  <History className="mr-2 h-4 w-4" />
                  {locale === "uz" ? "Tarix" : "История"}
                </Link>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {statCards.map((card, i) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                key={i}
                className={cn(
                  "relative group overflow-hidden bg-white dark:bg-slate-900 border rounded-[32px] p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-black/5 hover:-translate-y-1",
                  card.border
                )}
              >
                <div className="relative z-10">
                  <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center mb-5 transition-transform group-hover:scale-110", card.bg)}>
                    <card.icon className={cn("h-6 w-6", card.color)} />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-1">{card.label}</p>
                  <h3 className={cn("text-3xl font-black tracking-tight mb-1", card.color)}>
                    {card.value.toLocaleString()}
                  </h3>
                  <p className="text-[10px] font-bold text-muted-foreground italic">{card.description}</p>
                </div>
                {/* Visual Flair */}
                <div className={cn("absolute -right-4 -bottom-4 h-24 w-24 rounded-full opacity-[0.03] group-hover:opacity-10 transition-opacity", card.bg)} />
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content with Tabs */}
      <div className="container max-w-6xl mt-12">
        <Tabs defaultValue="listings" className="w-full">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
            <TabsList className="bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-border/50 h-auto self-start md:self-auto">
              <TabsTrigger value="listings" className="rounded-xl font-black text-xs uppercase tracking-widest py-3 px-8 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all">
                {locale === "uz" ? "E'lonlarim" : "Мои объявления"}
              </TabsTrigger>
              <TabsTrigger value="analytics" className="rounded-xl font-black text-xs uppercase tracking-widest py-3 px-8 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all">
                {locale === "uz" ? "Analitika" : "Аналитика"}
              </TabsTrigger>
            </TabsList>
            
            <div className="hidden md:flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Real-time synchronization active
            </div>
          </div>

          <TabsContent value="listings" className="space-y-8 outline-none">
            {listings.length > 0 ? (
              <div className="grid grid-cols-1 gap-8">
                {listings.map((listing, idx) => (
                  <motion.div 
                    key={listing.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="relative group bg-white dark:bg-slate-900 rounded-[40px] border border-border/50 shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden"
                  >
                    <div className="flex flex-col lg:flex-row">
                      <div className="flex-1">
                        <ListingCard listing={listing} />
                      </div>
                      
                      {/* Action Sidebar / Bottom Bar */}
                      <div className="lg:w-48 bg-muted/20 dark:bg-slate-900/50 p-6 flex flex-row lg:flex-col gap-4 border-t lg:border-t-0 lg:border-l border-border/50 shrink-0">
                        <Button 
                          asChild 
                          variant="outline" 
                          className="flex-1 lg:w-full h-14 rounded-2xl border-2 font-black uppercase text-[10px] tracking-widest hover:bg-white dark:hover:bg-slate-800 hover:text-primary hover:border-primary transition-all active:scale-95"
                        >
                          <Link href={`/listings/${listing.id}/edit`}>
                            <Edit3 className="h-4 w-4 mr-2" />
                            {locale === "uz" ? "Tahrirlash" : "Изм."}
                          </Link>
                        </Button>
                        
                        <Button 
                          variant="secondary" 
                          className={cn(
                            "flex-1 lg:w-full h-14 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all active:scale-95",
                            expandedListing === listing.id ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "bg-white dark:bg-slate-800 border border-border/50 shadow-sm hover:bg-muted"
                          )}
                          onClick={() => setExpandedListing(expandedListing === listing.id ? null : listing.id)}
                        >
                          {expandedListing === listing.id ? <ChevronUp className="h-4 w-4 mr-2 text-white" /> : <BarChart2 className="h-4 w-4 mr-2" />}
                          {locale === "uz" ? "Analitika" : "Анализиз"}
                        </Button>
                        
                        <Button
                          variant="ghost"
                          className="h-14 w-14 lg:w-full rounded-2xl text-destructive hover:bg-destructive/10 transition-colors hidden lg:flex items-center justify-center"
                          onClick={() => {
                             if(confirm(locale === "uz" ? "O'chirasizmi?" : "Удалить?")) {
                               fetch(`/api/listings/${listing.id}`, { method: "DELETE" }).then(() => window.location.reload());
                             }
                          }}
                        >
                          <PlusSquare className="h-5 w-5 rotate-45" />
                        </Button>
                      </div>
                    </div>
                    
                    <AnimatePresence>
                      {expandedListing === listing.id && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="border-t border-border/50 overflow-hidden bg-muted/10 p-4 md:p-8"
                        >
                          <div className="flex items-center justify-between mb-8">
                             <div>
                               <h4 className="text-xl font-black text-foreground uppercase tracking-tight">E'lon analitikasi</h4>
                               <p className="text-xs font-bold text-muted-foreground mt-1 lowercase opacity-60 italic">Oxirgi 30 kunlik ko'rsatkichlar asosida</p>
                             </div>
                             <div className="h-10 w-10 rounded-xl bg-white dark:bg-slate-800 border border-border flex items-center justify-center">
                               <TrendingUp className="h-5 w-5 text-emerald-500" />
                             </div>
                          </div>
                          <AnalyticsHeatmap listingId={listing.id} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-32 px-4 bg-white dark:bg-slate-900 rounded-[56px] border border-dashed border-border/50 text-center shadow-sm">
                <div className="h-24 w-24 bg-primary/5 rounded-[32px] flex items-center justify-center mb-8 border border-primary/10">
                  <PlusSquare className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-3xl font-black mb-4 uppercase tracking-tight">{t("dashboard.no_listings")}</h3>
                <p className="text-muted-foreground text-lg mb-10 max-w-md font-medium">{t("dashboard.no_listings_desc")}</p>
                <Button size="lg" className="h-16 px-10 rounded-2xl bg-primary text-white font-black uppercase text-sm tracking-widest shadow-2xl shadow-primary/20" asChild>
                  <Link href="/listings/create" className="flex items-center">
                    <PlusSquare className="mr-3 h-6 w-6" />
                    {t("dashboard.create_now")}
                  </Link>
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="analytics" className="outline-none">
             <div className="bg-white dark:bg-slate-900 rounded-[48px] border border-border/50 p-10 shadow-sm overflow-hidden relative min-h-[400px]">
                <div className="flex flex-col md:flex-row justify-between gap-10 relative z-10">
                   <div className="max-w-md">
                      <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                        <BarChart2 className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="text-3xl font-black uppercase tracking-tight mb-4">Umumiy ko'rsatkichlar</h3>
                      <p className="text-muted-foreground font-medium mb-8">
                        Barcha e'lonlaringiz bo'yicha umumiy trafik va foydalanuvchilar faolligini shu yerda kuzatishingiz mumkin.
                      </p>
                      
                      <div className="space-y-3">
                         <div className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl border border-border/40">
                            <span className="text-sm font-bold opacity-60">Listing Conversion</span>
                            <span className="font-black text-emerald-600">4.2%</span>
                         </div>
                         <div className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl border border-border/40">
                            <span className="text-sm font-bold opacity-60">Avg. Time on Page</span>
                            <span className="font-black text-blue-600">1:45s</span>
                         </div>
                      </div>
                   </div>
                   
                   <div className="flex-1 bg-muted/20 rounded-[32px] p-8 border border-border/40 flex flex-col items-center justify-center text-center">
                      <div className="h-20 w-20 bg-primary/5 rounded-full flex items-center justify-center mb-6 animate-pulse">
                        <TrendingUp className="h-10 w-10 text-primary" />
                      </div>
                      <p className="text-muted-foreground font-bold italic mb-6 max-w-xs">
                        Aniqroq ma'lumotlar uchun yuqoridagi e'lonlardan birini tanlab, uning shaxsiy analitikasini ko'ring.
                      </p>
                      <Button variant="outline" className="rounded-full px-8 h-12 font-black uppercase text-[10px] tracking-widest border-2">
                        Graph view coming soon
                      </Button>
                   </div>
                </div>
                {/* Visual Flair */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
             </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modern Fixed Bottom Mobile Nav Helper (Quick Actions) */}
      <div className="md:hidden fixed bottom-6 left-6 right-6 z-50">
         <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-[28px] p-2 shadow-2xl flex items-center justify-between">
            <Link href="/" className="flex flex-col items-center justify-center px-4 py-2 text-muted-foreground hover:text-primary transition-colors">
               <LayoutDashboard className="h-5 w-5" />
               <span className="text-[10px] font-black uppercase tracking-tighter mt-1">Main</span>
            </Link>
            <Button asChild className="h-14 w-14 rounded-2xl bg-primary text-white shadow-xl shadow-primary/20 scale-110 -translate-y-4">
               <Link href="/listings/create" className="flex items-center justify-center">
                  <Plus className="h-7 w-7" />
               </Link>
            </Button>
            <Link href="/chat" className="flex flex-col items-center justify-center px-4 py-2 text-muted-foreground hover:text-primary transition-colors">
               <Phone className="h-5 w-5" />
               <span className="text-[10px] font-black uppercase tracking-tighter mt-1">Help</span>
            </Link>
         </div>
      </div>
    </div>
  );
}
