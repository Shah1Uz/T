"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Upload, X, Navigation } from "lucide-react";
import LocationPicker from "@/components/location-picker";
import { useLocale } from "@/context/locale-context";
import { toast } from "sonner";

import { listingSchema } from "@/lib/validations";

export default function CreateListingPage() {
  const { t } = useLocale();
  const router = useRouter();
  const [locations, setLocations] = useState<any[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<any>(null);
  const [images, setImages] = useState<string[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      type: "sale",
      propertyType: "apartment",
      latitude: 41.2995,
      longitude: 69.2401,
      amenities: [],
    } as any,
  });

  useEffect(() => {
    fetch("/api/locations").then(res => res.json()).then(setLocations);
  }, []);

  const onSubmit = async (data: any) => {
    if (images.length === 0) {
      alert(t("create.images_desc") || "Iltimos, kamida bitta rasm yuklang!");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/listings", {
        method: "POST",
        body: JSON.stringify({ ...data, images, amenities: selectedAmenities }),
      });
      if (res.ok) {
        const listing = await res.json();
        toast.success(t("home.created") || "E'lon muvaffaqiyatli yaratildi!");
        router.push(`/listings/${listing.id}`);
      } else {
        const errorData = await res.json().catch(() => ({}));
        const errorMessage = errorData.details || errorData.error || "Server xatosi";
        console.error("Server Error:", errorMessage);
        alert("Server xatosi: " + errorMessage);
      }
    } catch (e) {
      console.error(e);
      alert("Tarmoq xatosi yuz berdi");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onError = (errors: any) => {
    console.error("Form Validation Errors:", errors);
    alert("Iltimos, barcha qatorlarni to'g'ri to'ldirganingizni tekshiring. Qizil bilan belgilangan qismlarga e'tibor bering.\n(Xona soni, maydoni va narxini albatta kiriting!)");
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Rasm yuklashda xatolik");
      }

      const data = await res.json();
      if (data.url) {
        setImages([...images, data.url]);
        toast.success(t("create.upload_success") || "Rasm yuklandi");
      } else {
        throw new Error("Rasm manzili (URL) topilmadi");
      }
    } catch (error: any) {
      console.error("Upload Error:", error);
      toast.error(error.message || "Rasm yuklashda xatolik yuz berdi");
    } finally {
      setIsUploading(false);
    }
  };

  if (!mounted) {
    return (
      <div className="container py-8 md:py-12 max-w-5xl animate-pulse space-y-8">
        <div className="h-10 bg-muted rounded-xl w-1/3"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
          <div className="space-y-6">
            <div className="h-80 bg-muted rounded-xl"></div>
            <div className="h-40 bg-muted rounded-xl"></div>
          </div>
          <div className="space-y-6">
            <div className="h-64 bg-muted rounded-xl"></div>
            <div className="h-32 bg-muted rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 md:py-12 max-w-5xl">
      <div className="mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">{t("create.title")}</h1>
          <p className="text-muted-foreground mt-2 text-lg">{t("create.subtitle")}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-8 md:space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
          
          <div className="space-y-6">
            <Card className="rounded-xl shadow-sm border overflow-hidden bg-card">
              <CardHeader className="p-6 pb-2 border-b">
                <CardTitle className="text-xl font-bold">{t("create.basic_info")}</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-5">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-foreground">{t("create.listing_title")}</Label>
                  <Input {...register("title")} placeholder={t("create.listing_title_placeholder")} className="h-12 rounded-lg px-4 bg-background border focus-visible:ring-primary focus-visible:border-primary transition-all text-base" />
                  {errors.title && <p className="text-sm font-bold text-destructive">{errors.title.message as string}</p>}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-foreground">{t("create.type")}</Label>
                    <select {...register("type")} className="w-full h-12 border rounded-lg px-3 bg-background focus:ring-1 focus:ring-primary outline-none transition-all text-base appearance-none cursor-pointer">
                      <option value="sale">{t("listing.sale")}</option>
                      <option value="rent">{t("listing.rent")}</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-foreground">{t("create.property_type")}</Label>
                    <select {...register("propertyType")} className="w-full h-12 border rounded-lg px-3 bg-background focus:ring-1 focus:ring-primary outline-none transition-all text-base appearance-none cursor-pointer">
                      <option value="apartment">{t("listing.apartment")}</option>
                      <option value="house">{t("listing.house")}</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-foreground">{t("create.price")}</Label>
                  <Input type="number" {...register("price")} placeholder={t("create.price_placeholder")} className="h-12 rounded-lg px-4 bg-background border focus-visible:ring-primary focus-visible:border-primary transition-all text-base font-medium" />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-foreground">{t("create.description")}</Label>
                  <Textarea {...register("description")} placeholder={t("create.description_placeholder")} className="min-h-[120px] rounded-lg px-4 py-3 bg-background border focus-visible:ring-primary focus-visible:border-primary transition-all text-base resize-y" />
                  {errors.description && <p className="text-sm font-bold text-destructive">{errors.description.message as string}</p>}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-xl shadow-sm border bg-card">
              <CardHeader className="p-6 pb-2 border-b">
                <CardTitle className="text-xl font-bold">{t("create.features_title")}</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-foreground">{t("create.rooms")}</Label>
                    <Input type="number" {...register("rooms")} className="h-12 rounded-lg text-center font-medium bg-background border" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-foreground">{t("create.area")}</Label>
                    <Input type="number" {...register("area")} className="h-12 rounded-lg text-center font-medium bg-background border" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-foreground">{t("create.floor")}</Label>
                    <Input type="number" {...register("floor")} className="h-12 rounded-lg text-center font-medium bg-background border" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-foreground">{t("create.total_floors")}</Label>
                    <Input type="number" {...register("totalFloors")} className="h-12 rounded-lg text-center font-medium bg-background border" />
                  </div>
                </div>

                <div className="pt-4 space-y-4">
                   <Label className="text-sm font-semibold text-foreground uppercase tracking-widest">{t("listing.features")}</Label>
                   <div className="grid grid-cols-2 gap-3">
                      {["Internet", "Konditsioner", "Mebel", "Televizor", "Xolodilnik", "Kir yuvish mashinasi", "Oshxona", "Balkon"].map((f) => (
                        <button
                          key={f}
                          type="button"
                          onClick={() => {
                            setSelectedAmenities(prev => 
                              prev.includes(f) ? prev.filter(a => a !== f) : [...prev, f]
                            );
                          }}
                          className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all font-bold text-sm ${selectedAmenities.includes(f) ? 'border-primary bg-primary/5 text-primary shadow-sm shadow-primary/20' : 'border-border bg-background text-muted-foreground hover:border-gray-300'}`}
                        >
                          <div className={`h-2.5 w-2.5 rounded-full ${selectedAmenities.includes(f) ? 'bg-primary' : 'bg-muted-foreground/30'}`}></div>
                          {f}
                        </button>
                      ))}
                   </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="rounded-xl shadow-sm border bg-card">
              <CardHeader className="p-6 pb-2 border-b">
                <CardTitle className="text-xl font-bold">{t("create.images")}</CardTitle>
                <p className="text-sm text-muted-foreground font-medium">{t("create.images_desc")}</p>
              </CardHeader>
              <CardContent className="p-6 pt-4 space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {images.map((url, i) => (
                    <div key={i} className="relative aspect-square rounded-lg overflow-hidden border group">
                      <img src={url} alt="listing" className="object-cover w-full h-full" />
                      <button
                        type="button"
                        onClick={() => setImages(images.filter((_, index) => index !== i))}
                        className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/70 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <label className="flex flex-col items-center justify-center aspect-square rounded-lg border-2 border-dashed border-muted-foreground/30 hover:bg-muted cursor-pointer transition-colors bg-background">
                    {isUploading ? <Loader2 className="h-6 w-6 text-primary animate-spin mb-1" /> : <Upload className="h-6 w-6 text-muted-foreground mb-1" />}
                    <span className="text-xs font-semibold text-muted-foreground">{t("create.upload")}</span>
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                  </label>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-xl shadow-sm border bg-card">
              <CardHeader className="p-6 pb-2 border-b">
                <CardTitle className="text-xl font-bold">{t("create.location")}</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-5">
                 {/* Region select */}
                 <div className="space-y-2">
                    <Label className="text-sm font-semibold text-foreground">{t("create.region")}</Label>
                    <select
                      className="w-full h-12 border rounded-lg px-3 bg-background focus:ring-1 focus:ring-primary outline-none transition-all text-base appearance-none cursor-pointer"
                      onChange={(e) => {
                        const region = locations.find(l => l.id === e.target.value) || null;
                        setSelectedRegion(region);
                        // If region has no children, use region itself as locationId
                        if (region && (!region.children || region.children.length === 0)) {
                          setValue("locationId", region.id);
                        } else {
                          setValue("locationId", "");
                        }
                      }}
                    >
                      <option value="">{t("create.region_placeholder")}</option>
                      {locations.map(loc => (
                        <option key={loc.id} value={loc.id}>{loc.name}</option>
                      ))}
                    </select>
                 </div>

                 {/* District select — only shown when selected region has children */}
                 {selectedRegion && selectedRegion.children && selectedRegion.children.length > 0 && (
                   <div className="space-y-2">
                     <Label className="text-sm font-semibold text-foreground">
                       {t("create.district") || (t("nav.login") === "Kirish" ? "Tuman" : "Район")}
                     </Label>
                     <select
                       {...register("locationId")}
                       className="w-full h-12 border rounded-lg px-3 bg-background focus:ring-1 focus:ring-primary outline-none transition-all text-base appearance-none cursor-pointer"
                       onChange={(e) => setValue("locationId", e.target.value)}
                     >
                       <option value="">
                         {t("create.district_placeholder") || (t("nav.login") === "Kirish" ? "Tumanni tanlang" : "Выберите район")}
                       </option>
                       {selectedRegion.children.map((child: any) => (
                         <option key={child.id} value={child.id}>{child.name}</option>
                       ))}
                     </select>
                     {errors.locationId && <p className="text-sm font-bold text-destructive">{errors.locationId.message as string}</p>}
                   </div>
                 )}
                 {(!selectedRegion || !selectedRegion.children || selectedRegion.children.length === 0) && errors.locationId && (
                   <p className="text-sm font-bold text-destructive">{errors.locationId.message as string}</p>
                 )}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <Label className="text-sm font-semibold text-foreground">{t("create.location_picker") || "Xaritada belgilash"}</Label>
                    <Button 
                      type="button"
                      variant="outline" 
                      size="sm" 
                      onClick={() => {
                        if (!navigator.geolocation) return alert("Geolocation not supported");
                        navigator.geolocation.getCurrentPosition(
                          (pos) => {
                            setValue("latitude", pos.coords.latitude);
                            setValue("longitude", pos.coords.longitude);
                          },
                          () => alert("Joylashuvni aniqlab bo'lmadi")
                        );
                      }}
                      className="h-8 rounded-lg text-xs font-bold gap-1.5 border-primary/20 text-primary hover:bg-primary/10"
                    >
                      <Navigation className="h-3 w-3 fill-current" />
                      {t("create.get_current_location") || "Mening joylashuvim"}
                    </Button>
                  </div>
                  <div className="h-[250px] rounded-lg overflow-hidden border relative">
                    <LocationPicker 
                      key={`${watch("latitude")}-${watch("longitude")}`}
                      initialLat={watch("latitude")}
                      initialLng={watch("longitude")}
                      onSelect={(lat, lng) => {
                        setValue("latitude", lat);
                        setValue("longitude", lng);
                      }} 
                    />
                  </div>
                 <div className="space-y-2 mt-4">
                    <Label className="text-sm font-semibold text-foreground">{t("listing.target") || "Mo'ljal"}</Label>
                    <Input {...register("landmark")} placeholder="Masalar: Korzinka yaqinida, Metro yonida" className="h-12 rounded-lg px-4 bg-background border focus-visible:ring-primary focus-visible:border-primary transition-all text-base" />
                 </div>

                  <div className="space-y-2 mt-4">
                     <Label className="text-sm font-semibold text-foreground">Metro</Label>
                     <Input {...register("metroInfo")} placeholder="Masalan: Metroga 7 daqiqa yoki Metro yo'q" className="h-12 rounded-lg px-4 bg-background border focus-visible:ring-primary focus-visible:border-primary transition-all text-base" />
                  </div>
              </CardContent>
            </Card>
            
            <Card className="rounded-xl shadow-sm border bg-card">
              <CardHeader className="p-6 pb-2 border-b">
                <CardTitle className="text-xl font-bold">{t("create.contact")}</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-foreground">{t("create.phone")}</Label>
                  <Input {...register("phone")} placeholder={t("create.phone_placeholder")} className="h-12 rounded-lg px-4 bg-background border focus-visible:ring-primary focus-visible:border-primary transition-all text-lg font-medium tracking-wide" />
                  {errors.phone && <p className="text-sm font-bold text-destructive">{errors.phone.message as string}</p>}
                </div>
              </CardContent>
            </Card>
          </div>

        </div>

        <div className="bg-muted/40 p-6 md:p-8 rounded-xl flex flex-col md:flex-row items-center justify-between gap-6 border">
          <div className="flex items-center gap-4 text-center md:text-left">
            <div>
              <div className="font-bold text-xl text-foreground">{t("create.ready_to_publish")}</div>
              <div className="text-sm text-muted-foreground mt-1 max-w-lg">{t("create.publish_desc")}</div>
            </div>
          </div>
          <Button size="lg" className="w-full md:w-auto px-8 h-14 text-base font-bold rounded-lg shadow-none" disabled={isSubmitting}>
            {isSubmitting ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> {t("home.creating")}</> : t("create.submit")}
          </Button>
        </div>
      </form>
    </div>
  );
}
