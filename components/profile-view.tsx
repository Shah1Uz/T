"use client";

import React from "react";
import { useLocale } from "@/context/locale-context";
import Image from "next/image";
import ListingCard from "@/components/listing-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Calendar, LayoutGrid, Phone, MessageSquare, ArrowLeft } from "lucide-react";
import Link from 'next/link';
import { cn } from "@/lib/utils";
import VerifiedBadge from "@/components/verified-badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ReviewSection from "./review-section";
import StarRating from "./star-rating";

interface ProfileViewProps {
  user: any;
  listings: any[];
}

export default function ProfileView({ user, listings }: ProfileViewProps) {
  const { t, locale } = useLocale();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Premium Header/Banner */}
      <div className="relative h-[250px] md:h-[350px] overflow-hidden group">
        {user.profileBannerUrl ? (
           <Image 
             src={user.profileBannerUrl} 
             alt="Profile Banner" 
             fill 
             priority
             className="object-cover transition-transform duration-700 group-hover:scale-105" 
           />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/5 to-transparent">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
          </div>
        )}
        
        {/* Banner Overlay Gradient - White Fade at bottom */}
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background via-background/50 to-transparent z-10" />

        <div className="container h-full flex items-end pb-8 relative z-10">
          <Link href="/" className="absolute top-6 left-6 h-10 w-10 bg-card/80 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20 hover:bg-card transition-all shadow-lg hover:scale-110 active:scale-95 group/back">
            <ArrowLeft className="h-5 w-5 text-foreground transition-transform group-hover/back:-translate-x-1" />
          </Link>
        </div>
      </div>

      <div className="container -mt-20 relative z-10 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Sidebar: Profile Info */}
          <div className="lg:col-span-1">
            <Card className="border-none shadow-2xl shadow-primary/5 rounded-[32px] overflow-hidden bg-card/80 backdrop-blur-xl border border-background/40 sticky top-24">
              <CardContent className="p-8 flex flex-col items-center text-center">
                <div className="relative h-32 w-32 rounded-full overflow-hidden border-4 border-background shadow-xl mb-6 group">
                  {user.imageUrl ? (
                    <Image src={user.imageUrl} fill alt={user.name} className="object-cover transition-transform duration-500 group-hover:scale-110" />
                  ) : (
                    <div className="h-full w-full bg-primary/10 flex items-center justify-center font-black text-4xl text-primary">
                      {user.name?.[0] || 'U'}
                    </div>
                  )}
                </div>

                <div className="space-y-2 mb-6">
                  <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight flex items-center justify-center gap-2 break-words">
                    {user.name || "Sotuvchi"}
                    {user.isVerified && <VerifiedBadge iconClassName="w-5 h-5" />}
                    {user.plan && user.plan !== "FREE" && (
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
                  </h1>
                  
                  <div className="flex flex-col items-center gap-1">
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">{t("listing.seller") || "Sotuvchi"}</p>
                    {user.reviewsReceived && user.reviewsReceived.length > 0 && (
                      <div className="flex items-center gap-2">
                        <StarRating rating={user.reviewsReceived.reduce((acc: number, r: any) => acc + r.rating, 0) / user.reviewsReceived.length} size={14} />
                        <span className="text-xs font-black text-amber-500">({user.reviewsReceived.length})</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="w-full space-y-4 pt-6 border-t border-border">
                  <div className="flex items-center gap-4 text-left">
                    <div className="h-10 w-10 bg-blue-500/10 rounded-xl flex items-center justify-center shrink-0">
                      <LayoutGrid className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t("profile.total_listings") || "E'lonlar"}</p>
                      <p className="text-lg font-black text-foreground">{listings.length}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-left">
                    <div className="h-10 w-10 bg-amber-500/10 rounded-xl flex items-center justify-center shrink-0">
                      <Calendar className="h-5 w-5 text-amber-500" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t("profile.joined") || "Ro'yxatdan o'tgan"}</p>
                      <p className="text-sm font-bold text-foreground">
                        {mounted ? new Date(user.createdAt).toLocaleDateString(locale === 'uz' ? 'uz-UZ' : 'ru-RU', { month: 'long', year: 'numeric' }) : "..."}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="w-full pt-8 space-y-3">
                   <Button className="w-full h-12 rounded-2xl font-bold transition-transform hover:-translate-y-0.5" asChild>
                     <a href={`tel:${user.phone || ""}`}>
                       <Phone className="h-4 w-4 mr-2" />
                       {t("listing.contact") || "Bog'lanish"}
                     </a>
                   </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Areas */}
          <div className="lg:col-span-3 space-y-8">
            <Tabs defaultValue="listings" className="w-full">
               <TabsList className="bg-muted/50 p-1 rounded-2xl h-14 mb-8">
                  <TabsTrigger value="listings" className="rounded-xl px-8 font-bold text-sm h-full data-[state=active]:bg-card">{t("profile.listings_title") || "E'lonlar"}</TabsTrigger>
                  <TabsTrigger value="reviews" className="rounded-xl px-8 font-bold text-sm h-full data-[state=active]:bg-card">{t("profile.reviews") || "Sharhlar"}</TabsTrigger>
               </TabsList>

               <TabsContent value="listings" className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-3xl font-black text-foreground tracking-tight mb-1">{t("profile.listings_title") || "Sotuvchining barcha e'lonlari"}</h2>
                      <p className="text-muted-foreground font-bold text-sm">{listings.length} {t("profile.listings_count") || "ta faol e'lon"}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 3xl:grid-cols-2 gap-6">
                    {listings.length > 0 ? (
                      listings.map((l: any) => (
                        <ListingCard key={l.id} listing={l} />
                      ))
                    ) : (
                      <div className="bg-card rounded-[32px] p-20 text-center border-2 border-dashed border-border">
                        <div className="text-5xl mb-4">🏠</div>
                        <h3 className="text-xl font-black text-foreground mb-2">{t("profile.no_listings") || "Hozircha e'lonlar yo'q"}</h3>
                        <p className="text-muted-foreground font-bold">{t("profile.no_listings_desc") || "Sotuvchi hali birorta ham e'lon joylashtirmagan."}</p>
                      </div>
                    )}
                  </div>
               </TabsContent>

               <TabsContent value="reviews" className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                  <ReviewSection userId={user.id} initialReviews={user.reviewsReceived || []} />
               </TabsContent>
            </Tabs>
          </div>

        </div>
      </div>
    </div>
  );
}
