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
import { Loader2, Upload, X, Save, ArrowLeft, Navigation } from "lucide-react";
import LocationPicker from "@/components/location-picker";
import { useLocale } from "@/context/locale-context";
import Link from "next/link";
import Image from "next/image";

const listingSchema = z.object({
  title: z.string().min(5),
  description: z.string().min(20),
  price: z.coerce.number().positive(),
  type: z.enum(["sale", "rent"]),
  propertyType: z.enum(["apartment", "house"]),
  rooms: z.coerce.number().int().min(1),
  area: z.coerce.number().positive(),
  floor: z.coerce.number().int(),
  totalFloors: z.coerce.number().int(),
  phone: z.string().min(9),
  locationId: z.string().min(1),
  latitude: z.number(),
  longitude: z.number(),
});

export default function EditListingClient({ listing }: { listing: any }) {
  const { t, locale } = useLocale();
  const router = useRouter();
  const [locations, setLocations] = useState<any[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<any>(null);
  const [images, setImages] = useState<string[]>(listing.images.map((img: any) => img.url));
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      title: listing.title,
      description: listing.description,
      price: listing.price,
      type: listing.type,
      propertyType: listing.propertyType,
      rooms: listing.rooms,
      area: listing.area,
      floor: listing.floor,
      totalFloors: listing.totalFloors,
      phone: listing.phone,
      locationId: listing.locationId,
      latitude: listing.latitude,
      longitude: listing.longitude,
    } as any,
  });

  useEffect(() => {
    fetch("/api/locations").then(res => res.json()).then(data => {
      setLocations(data);
      // Find initial region
      const region = data.find((l: any) => 
        l.id === listing.locationId || 
        l.children?.some((c: any) => c.id === listing.locationId)
      );
      setSelectedRegion(region);
    });
  }, [listing.locationId]);

  const onSubmit = async (data: any) => {
    if (images.length === 0) {
      alert(t("create.images_desc") || "Iltimos, kamida bitta rasm yuklang!");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/listings/${listing.id}`, {
        method: "PATCH",
        body: JSON.stringify({ ...data, images }),
      });
      if (res.ok) {
        router.push(`/listings/${listing.id}`);
        router.refresh();
      } else {
        const errDetails = await res.text();
        alert("Server xatosi: " + errDetails);
      }
    } catch (e) {
      alert("Tarmoq xatosi yuz berdi");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      setImages([...images, data.url]);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="container py-8 md:py-12 max-w-5xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <Link href="/dashboard" className="flex items-center text-sm font-bold text-muted-foreground hover:text-primary transition-colors mb-2">
            <ArrowLeft className="h-4 w-4 mr-1" />
            {t("dashboard.title")}
          </Link>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight">
            {locale === "uz" ? "E'lonni tahrirlash" : "Редактировать объявление"}
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-8">
            <Card className="rounded-[32px] border-none shadow-xl bg-card overflow-hidden">
              <CardHeader className="bg-muted/30 pb-6 border-b">
                <CardTitle className="text-xl font-black">{t("create.basic_info")}</CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="space-y-2">
                  <Label className="text-sm font-bold uppercase tracking-widest text-muted-foreground">{t("create.listing_title")}</Label>
                  <Input {...register("title")} className="h-14 rounded-2xl bg-muted/20 border-none font-bold text-lg" />
                  {errors.title && <p className="text-xs font-bold text-destructive">{errors.title.message as string}</p>}
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-bold uppercase tracking-widest text-muted-foreground">{t("create.type")}</Label>
                    <select {...register("type")} className="w-full h-14 bg-muted/20 rounded-2xl px-4 font-bold outline-none appearance-none">
                      <option value="sale">{t("listing.sale")}</option>
                      <option value="rent">{t("listing.rent")}</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-bold uppercase tracking-widest text-muted-foreground">{t("create.property_type")}</Label>
                    <select {...register("propertyType")} className="w-full h-14 bg-muted/20 rounded-2xl px-4 font-bold outline-none appearance-none">
                      <option value="apartment">{t("listing.apartment")}</option>
                      <option value="house">{t("listing.house")}</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-bold uppercase tracking-widest text-muted-foreground">{t("create.price")} (USD)</Label>
                  <Input type="number" {...register("price")} className="h-14 rounded-2xl bg-muted/20 border-none font-black text-2xl text-primary" />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-bold uppercase tracking-widest text-muted-foreground">{t("create.description")}</Label>
                  <Textarea {...register("description")} className="min-h-[200px] rounded-2xl bg-muted/20 border-none font-medium text-base p-4" />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[32px] border-none shadow-xl bg-card overflow-hidden">
              <CardHeader className="bg-muted/30 pb-6 border-b">
                <CardTitle className="text-xl font-black">{t("create.features_title")}</CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase text-muted-foreground">{t("create.rooms")}</Label>
                    <Input type="number" {...register("rooms")} className="h-14 rounded-2xl bg-muted/20 border-none text-center font-black text-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase text-muted-foreground">{t("create.area")} (m²)</Label>
                    <Input type="number" {...register("area")} className="h-14 rounded-2xl bg-muted/20 border-none text-center font-black text-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase text-muted-foreground">{t("create.floor")}</Label>
                    <Input type="number" {...register("floor")} className="h-14 rounded-2xl bg-muted/20 border-none text-center font-black text-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase text-muted-foreground">{t("create.total_floors")}</Label>
                    <Input type="number" {...register("totalFloors")} className="h-14 rounded-2xl bg-muted/20 border-none text-center font-black text-xl" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-8">
            <Card className="rounded-[32px] border-none shadow-xl bg-card overflow-hidden">
              <CardHeader className="bg-muted/30 pb-6 border-b">
                <CardTitle className="text-xl font-black">{t("create.images")}</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {images.map((url, i) => (
                    <div key={i} className="relative aspect-square rounded-[20px] overflow-hidden group shadow-sm">
                      <Image src={url} fill alt="" className="object-cover" />
                      <button
                        type="button"
                        onClick={() => setImages(images.filter((_, index) => index !== i))}
                        className="absolute top-2 right-2 h-8 w-8 bg-card/90 backdrop-blur-md rounded-full flex items-center justify-center text-destructive opacity-0 group-hover:opacity-100 transition-all shadow-md"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <label className="flex flex-col items-center justify-center aspect-square rounded-[20px] border-2 border-dashed border-muted-foreground/20 hover:bg-muted/30 cursor-pointer transition-all bg-muted/10 group">
                    {isUploading ? <Loader2 className="h-6 w-6 text-primary animate-spin" /> : <Upload className="h-6 w-6 text-muted-foreground group-hover:scale-110 transition-transform" />}
                    <span className="text-[10px] font-bold uppercase mt-2 text-muted-foreground tracking-widest">{t("create.upload")}</span>
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                  </label>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[32px] border-none shadow-xl bg-card overflow-hidden">
              <CardHeader className="bg-muted/30 pb-6 border-b">
                <CardTitle className="text-xl font-black">{t("create.location")}</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase text-muted-foreground">{t("create.region")}</Label>
                  <select
                    className="w-full h-12 bg-muted/20 rounded-xl px-4 font-bold outline-none"
                    value={selectedRegion?.id || ""}
                    onChange={(e) => {
                      const region = locations.find(l => l.id === e.target.value);
                      setSelectedRegion(region);
                      setValue("locationId", region?.id || "");
                    }}
                  >
                    <option value="">{t("create.region_placeholder")}</option>
                    {locations.map(loc => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
                  </select>
                </div>

                {selectedRegion?.children?.length > 0 && (
                  <div className="space-y-2 animate-in fade-in slide-in-from-top-1">
                    <Label className="text-xs font-bold uppercase text-muted-foreground">{t("create.district")}</Label>
                    <select
                      {...register("locationId")}
                      className="w-full h-12 bg-muted/20 rounded-xl px-4 font-bold outline-none"
                    >
                      <option value="">{t("create.district_placeholder")}</option>
                      {selectedRegion.children.map((child: any) => <option key={child.id} value={child.id}>{child.name}</option>)}
                    </select>
                  </div>
                )}

                <div className="flex items-center justify-between gap-2 mb-2">
                  <Label className="text-xs font-bold uppercase text-muted-foreground">{t("create.location_picker") || "Xaritada belgilash"}</Label>
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
                <div className="h-[200px] rounded-2xl overflow-hidden border shadow-inner">
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
              </CardContent>
            </Card>

            <Button size="lg" className="w-full h-20 rounded-[28px] text-xl font-black shadow-2xl flex items-center justify-center gap-3" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="h-6 w-6 animate-spin" /> : <Save className="h-6 w-6" />}
              {locale === "uz" ? "O'zgarishlarni saqlash" : "Сохранить изменения"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
