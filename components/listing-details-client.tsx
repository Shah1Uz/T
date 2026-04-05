"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useLocale } from "@/context/locale-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Bed, Move, MapPin, Phone, MessageSquare, 
  Calendar, Eye, Heart, Share2, Trash2 
} from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import ListingMap from "@/components/listing-map";
import CommentSection from "@/components/comment-section";
import StartChatButton from "@/components/start-chat-button";
import ViewCounter from "@/components/view-counter";
import VerifiedBadge from "@/components/verified-badge";
import MortgageCalculator from "@/components/mortgage-calculator";
import AmenitiesView from "@/components/amenities-view";
import NeighborhoodData from "@/components/neighborhood-data";
import RepairCalculator from "@/components/repair-calculator";
import ReviewSection from "@/components/review-section";
import StarRating from "@/components/star-rating";
import ImageGallery from "@/components/image-gallery";
import CallFeedbackModal from "@/components/call-feedback-modal";
import { toast } from "sonner";

export default function ListingDetailsClient({ listing, isOwner }: { listing: any; isOwner: boolean }) {
  const { t, locale } = useLocale();
  const router = useRouter();
  const { user, isLoaded, isSignedIn } = useUser();
  const [isFavorited, setIsFavorited] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);
  const [pendingCall, setPendingCall] = useState(false);
  const [rating, setRating] = useState(listing.ratingAverage || 0);
  const [ratingCount, setRatingCount] = useState(listing.ratingCount || 0);
  const [userRating, setUserRating] = useState<number | null>(null);

  useEffect(() => {
    setMounted(true);
    // Fetch current user's rating for this listing
    if (isSignedIn) {
      import("@/server/actions/rating.action").then(({ getListingRatingAction }) => {
        getListingRatingAction(listing.id).then(res => {
          if (res.success === true) {
            setRating(res.ratingAverage);
            setRatingCount(res.ratingCount);
            setUserRating(res.userRating);
          }
        });
      });
    }
  }, [isSignedIn, listing.id]);

  const handleRate = async (newRating: number) => {
    if (!isSignedIn) return toast.error(t("nav.login") || "Tizimga kiring!");
    try {
      const { rateListingAction } = await import("@/server/actions/rating.action");
      const res = await rateListingAction(listing.id, newRating);
      if (res.success && res.listing) {
        setRating(res.listing.ratingAverage);
        setRatingCount(res.listing.ratingCount);
        setUserRating(newRating);
        toast.success("Rahmat! Bahoingiz qabul qilindi.");
      }
    } catch (err) {
      toast.error("Xatolik yuz berdi.");
    }
  };

  useEffect(() => {
    if (isLoaded && isSignedIn && listing.favorites) {
      setIsFavorited(listing.favorites.some((f: any) => f.userId === user.id));
    }
  }, [isLoaded, isSignedIn, listing.favorites, user]);

  useEffect(() => {
    const handleReturn = () => {
      if (pendingCall) {
        setIsCallModalOpen(true);
        setPendingCall(false);
      }
    };

    window.addEventListener("focus", handleReturn);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") handleReturn();
    });

    return () => {
      window.removeEventListener("focus", handleReturn);
      document.removeEventListener("visibilitychange", handleReturn);
    };
  }, [pendingCall]);

  const handleFavorite = async () => {
    if (!isSignedIn) return alert(t("nav.login") || "Tizimga kiring!");
    const old = isFavorited;
    setIsFavorited(!old);
    try {
      const res = await fetch("/api/favorites", {
        method: "POST",
        body: JSON.stringify({ listingId: listing.id })
      });
      if (!res.ok) setIsFavorited(old);
    } catch {
      setIsFavorited(old);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: listing.title,
          url
        });
      } catch {}
    } else {
      navigator.clipboard.writeText(url);
      toast.success(t("common.link_copied") || "Havola nusxalandi!");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Rostdan ham bu e'lonni o'chirmoqchimisiz?")) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/listings/${listing.id}`, { method: "DELETE" });
      if (res.ok) {
        alert("E'lon o'chirildi!");
        router.push("/dashboard"); 
      } else {
        alert("O'chirishda xatolik yuz berdi.");
      }
    } catch {
      alert("Tarmoq xatosi.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="container py-4 md:py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-10">
        
        {/* Left Column: Content */}
        <div className="lg:col-span-2 space-y-8 md:space-y-10">
          {/* Interactive Image Gallery Section */}
          <ImageGallery listing={listing} />

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             {[
               { icon: Bed, label: t("common.rooms"), value: `${listing.rooms}` },
               { icon: Move, label: t("common.area"), value: `${listing.area} m²` },
               { icon: MapPin, label: t("common.floor"), value: `${listing.floor}/${listing.totalFloors}` },
             ].map((stat, i) => (
               <Card key={i} className="border-none bg-secondary/50 dark:bg-card/50 hover:bg-primary/5 transition-colors duration-300 rounded-[24px] group overflow-hidden relative">
                 <CardContent className="p-6 flex flex-col items-center justify-center text-center gap-2">
                   <div className="h-10 w-10 bg-background dark:bg-muted rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                      <stat.icon className="h-5 w-5 text-primary" />
                   </div>
                   <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{stat.label}</span>
                   <span className="text-lg font-black text-foreground">{stat.value}</span>
                 </CardContent>
               </Card>
             ))}
             {/* Real-time view counter card */}
             <Card className="border-none bg-secondary/50 dark:bg-card/50 hover:bg-primary/5 transition-colors duration-300 rounded-[24px] group overflow-hidden relative">
               <CardContent className="p-6 flex flex-col items-center justify-center text-center gap-2">
                 <div className="h-10 w-10 bg-background dark:bg-muted rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                   <Eye className="h-5 w-5 text-primary" />
                 </div>
                 <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t("common.views")}</span>
                 <ViewCounter listingId={listing.id} initialCount={listing.views?.length || 0} />
               </CardContent>
             </Card>
          </div>

          {/* Content Tabs */}
          {!mounted ? (
            <div className="w-full h-[400px] bg-secondary/50 dark:bg-card/50 animate-pulse rounded-[32px] border border-border flex items-center justify-center text-muted-foreground font-bold italic">
              {t("common.loading") || "Yuklanmoqda..."}
            </div>
          ) : (
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="bg-muted/50 p-1.5 rounded-[20px] h-14 w-full md:w-auto">
                <TabsTrigger value="details" className="rounded-[14px] px-8 font-bold data-[state=active]:bg-card data-[state=active]:shadow-md transition-all">{t("listing.details")}</TabsTrigger>
                <TabsTrigger value="location" className="rounded-[14px] px-8 font-bold data-[state=active]:bg-card data-[state=active]:shadow-md transition-all">{t("listing.location")}</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="mt-8 space-y-8 animate-in fade-in slide-in-from-bottom-2">
                <div className="prose prose-slate max-w-none 3xl:max-w-4xl">
                  <h3 className="text-2xl 3xl:text-4xl font-black text-foreground mb-4 3xl:mb-8">{t("listing.description")}</h3>
                  <p className="text-muted-foreground 3xl:text-2xl text-lg leading-relaxed whitespace-pre-wrap font-medium">
                    {listing.description}
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8 border-t border-border">
                  <div className="space-y-4">
                    <h4 className="font-black text-foreground uppercase tracking-widest text-sm">{t("listing.features")}</h4>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {listing.amenities && listing.amenities.length > 0 ? (
                          listing.amenities.map((f: string, i: number) => (
                            <li key={i} className="flex items-center gap-3 text-muted-foreground font-bold">
                              <div className="h-2 w-2 rounded-full bg-primary/40"></div>
                              {f}
                            </li>
                          ))
                        ) : (
                          <div className="col-span-2 p-4 bg-muted/30 rounded-2xl border border-dashed border-border flex flex-col items-center text-center gap-2">
                            <MapPin className="h-5 w-5 text-muted-foreground/50" />
                            <p className="text-muted-foreground text-[13px] font-bold">
                              {locale === "uz" 
                                ? "E'lon beruvchi tomonidan qulayliklar ko'rsatilmagan. Quyida avtomatik tahlilni ko'rishingiz mumkin." 
                                : "Удобства не указаны автором. Ниже вы можете увидеть автоматический анализ."}
                            </p>
                          </div>
                        )}
                    </ul>
                  </div>
                </div>

                {/* Nearby Amenities */}
                {(listing.latitude && listing.longitude) && (
                  <div className="pt-8 border-t border-border">
                    <AmenitiesView lat={listing.latitude} lng={listing.longitude} />
                  </div>
                )}

                {/* Neighborhood & Eco Data */}
                <div className="pt-8 border-t border-border space-y-6">
                   {listing.metroInfo && (
                      <div className="flex items-start gap-4 p-5 bg-primary/5 rounded-[24px] border border-primary/10">
                         <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                            <MapPin className="h-5 w-5 text-primary" />
                         </div>
                         <div>
                            <h5 className="font-black text-primary uppercase tracking-widest text-xs mb-1">Metro / Transport</h5>
                            <p className="text-foreground font-bold text-lg">{listing.metroInfo}</p>
                         </div>
                      </div>
                   )}
                   {(listing.latitude && listing.longitude) && (
                     <NeighborhoodData lat={listing.latitude} lng={listing.longitude} />
                   )}
                </div>
                
                {listing.type === "sale" && (
                  <div className="pt-8 border-t border-border space-y-8">
                    <MortgageCalculator price={listing.price || 0} />
                    <RepairCalculator area={listing.area || 0} />
                  </div>
                )}
                
                <CommentSection listingId={listing.id} comments={listing.comments} />
              </TabsContent>
              
              <TabsContent value="location" className="mt-8 h-[450px] rounded-[32px] overflow-hidden border border-border shadow-inner bg-muted/50">
                <ListingMap lat={listing.latitude} lng={listing.longitude} title={listing.title} />
              </TabsContent>
            </Tabs>
          )}
        </div>

        {/* Right Column: Sticky Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-[100px] space-y-6">
            <Card className="border-none bg-card/60 backdrop-blur-xl shadow-2xl rounded-[32px] overflow-hidden border border-border/20">
              <CardContent className="p-8">
                <div className="mb-8">
                   <div className="flex items-center justify-between mb-2">
                     <div className="text-sm font-bold text-primary uppercase tracking-widest px-3 py-1 bg-primary/10 w-max rounded-lg border border-primary/20">{t("listing.price_details")}</div>
                     {listing.user?.plan !== "VIP" && (
                       <div className="flex items-center gap-1.5 bg-muted/40 px-3 py-1.5 rounded-xl border border-border/40">
                         <StarRating rating={rating} onRatingChange={handleRate} size={18} />
                         <span className="text-[15px] font-black tabular-nums">{Number(rating).toFixed(1)}</span>
                         {ratingCount > 0 && <span className="text-xs font-bold opacity-50">({ratingCount})</span>}
                       </div>
                     )}
                   </div>
                   <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-black text-foreground tracking-tight">{(listing.price || 0).toLocaleString("en-US")}</span>
                      <span className="text-xl font-bold text-gray-400">USD</span>
                   </div>
                   <p className="text-gray-400 font-bold mt-1 uppercase text-xs tracking-widest">~ {(listing.price * 12600).toLocaleString("en-US")} UZS</p>
                </div>

                {/* Seller Profile */}
                <Link href={`/profile/${listing.userId}`} className="mb-6 flex items-center gap-4 bg-muted/50 p-4 rounded-[20px] border border-border min-h-[72px] hover:bg-card transition-colors group/seller">
                  {listing.user?.imageUrl ? (
                    <div className="relative h-12 w-12 rounded-full overflow-hidden border-2 border-background shadow-sm shrink-0 group-hover/seller:scale-105 transition-transform">
                      <Image src={listing.user.imageUrl} fill alt={listing.user?.name || "Sotuvchi"} className="object-cover" />
                    </div>
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary shrink-0 border-2 border-background shadow-sm group-hover/seller:scale-105 transition-transform">
                      {listing.user?.name?.[0] || 'U'}
                    </div>
                  )}
                  <div className="min-w-0">
                    <h3 className="font-bold text-foreground text-[15px] flex items-center gap-1.5 truncate group-hover/seller:text-primary transition-colors">
                      {listing.user?.name || "Xususiy E'lon"}
                      {listing.user?.isVerified && <VerifiedBadge className="shrink-0" iconClassName="w-4 h-4" />}
                    </h3>
                    <div className="flex items-center gap-2">
                       <p className="text-xs text-muted-foreground font-semibold shrink-0 uppercase tracking-tighter">Profilni ko'rish</p>
                       {listing.user?.reviewsReceived && listing.user?.reviewsReceived.length > 0 && (
                          <div className="flex items-center gap-1 bg-amber-500/10 px-1.5 py-0.5 rounded-md border border-amber-500/20">
                             <StarRating rating={listing.user.reviewsReceived.reduce((acc: number, r: any) => acc + r.rating, 0) / listing.user.reviewsReceived.length} size={10} />
                             <span className="text-[10px] font-black text-amber-600">{listing.user.reviewsReceived.length}</span>
                          </div>
                       )}
                    </div>
                  </div>
                </Link>

                <div className="space-y-3.5">
                  <a 
                    href={`tel:${listing.phone || "+998900000000"}`} 
                    className="block"
                    onClick={() => setPendingCall(true)}
                  >
                    <Button className="w-full h-14 text-[16px] font-bold rounded-[16px] shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all hover:-translate-y-0.5" size="lg">
                      <Phone className="h-[18px] w-[18px] mr-2 animate-pulse" />
                      {listing.phone || t("listing.phone")}
                    </Button>
                  </a>
                  <StartChatButton listingId={listing.id} sellerId={listing.userId} />
                </div>

                <div className="flex gap-3 pt-6 mt-6 border-t border-border">
                  <Button onClick={handleFavorite} variant={isFavorited ? "default" : "outline"} className={`flex-1 rounded-xl font-bold border-2 h-12 ${isFavorited ? "bg-red-500 hover:bg-red-600 text-white border-red-500" : ""}`}>
                    <Heart className={`h-5 w-5 mr-2 ${isFavorited ? "fill-current" : "text-gray-400 group-hover:text-red-500 transition-colors"}`} />
                    {isFavorited ? (t("common.liked") || "Liked") : (t("common.like") || "Like")}
                  </Button>
                  <Button onClick={handleShare} variant="outline" size="icon" className="rounded-xl border-2 h-12 w-12 text-gray-400">
                    <Share2 className="h-5 w-5" />
                  </Button>
                </div>

                {isOwner && (
                  <div className="pt-4 mt-4 border-t border-border">
                    <Button 
                      onClick={handleDelete} 
                      disabled={isDeleting}
                      variant="destructive" 
                      className="w-full rounded-xl font-bold h-12 shadow-md hover:shadow-lg transition-all"
                    >
                      <Trash2 className="h-5 w-5 mr-2" />
                      {isDeleting ? "O'chirilmoqda..." : "O'chirish"}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <CallFeedbackModal 
        isOpen={isCallModalOpen} 
        onClose={() => setIsCallModalOpen(false)} 
        listingId={listing.id} 
      />
    </div>
  );
}
