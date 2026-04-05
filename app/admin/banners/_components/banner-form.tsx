"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowLeft, Image as ImageIcon, Crop as CropIcon } from "lucide-react";
import Link from "next/link";
import { createBannerAction, updateBannerAction } from "@/server/actions/banner.action";

import ReactCrop, { type Crop, type PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

interface BannerFormProps {
  initialData?: any;
  isEdit?: boolean;
}

export default function BannerForm({ initialData, isEdit = false }: BannerFormProps) {
  const router = useRouter();
  
  // Banner details
  const [imageUrl, setImageUrl] = useState<string>(initialData?.imageUrl || "");
  const [title, setTitle] = useState(initialData?.title || "");
  const [subtext, setSubtext] = useState(initialData?.subtext || "");
  const [buttonText, setButtonText] = useState(initialData?.buttonText || "");
  const [bgColor, setBgColor] = useState(initialData?.bgColor || "#f3f4f6");
  const [bgPattern, setBgPattern] = useState(initialData?.bgPattern || "");
  const [link, setLink] = useState(initialData?.link || "");
  const [order, setOrder] = useState(initialData?.order?.toString() || "0");
  const [width, setWidth] = useState(initialData?.width || "100%");
  const [height, setHeight] = useState(initialData?.height || "400px");
  const [duration, setDuration] = useState(initialData?.duration?.toString() || "3");

  // States
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cropping states
  const [imgSrc, setImgSrc] = useState("");
  const imgRef = useRef<HTMLImageElement>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [isCropping, setIsCropping] = useState(false);

  function onSelectFile(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      setIsCropping(true);
      setCrop(undefined); 
      const reader = new FileReader();
      reader.addEventListener('load', () =>
        setImgSrc(reader.result?.toString() || '')
      );
      reader.readAsDataURL(e.target.files[0]);
    }
  }

  const getCroppedImg = async (image: HTMLImageElement, crop: PixelCrop): Promise<Blob> => {
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext('2d');

    if (!ctx) throw new Error('No 2d context');

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height
    );

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) return reject(new Error('Canvas is empty'));
        resolve(blob);
      }, 'image/jpeg', 0.95);
    });
  };

  const handleApplyCrop = async () => {
    if (!completedCrop || !imgRef.current) return;
    
    setIsUploading(true);
    try {
      const croppedBlob = await getCroppedImg(imgRef.current, completedCrop);
      const formData = new FormData();
      formData.append("file", croppedBlob, "banner.jpg");

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      
      setImageUrl(data.url);
      setIsCropping(false);
    } catch (error) {
      console.error(error);
      alert("Rasmni saqlashda xatolik yuz berdi");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl) {
      alert("Iltimos, banner rasmini yuklang");
      return;
    }

    setIsSubmitting(true);
    
    const bannerData = {
      imageUrl,
      title: title || undefined,
      subtext: subtext || undefined,
      buttonText: buttonText || undefined,
      bgColor,
      bgPattern: bgPattern || undefined,
      link: link || undefined,
      order: parseInt(order),
      width,
      height,
      duration: parseInt(duration) || 3,
      isActive: initialData?.isActive ?? true,
    };

    const res = isEdit 
      ? await updateBannerAction(initialData.id, bannerData)
      : await createBannerAction(bannerData);

    if (res.success) {
      router.push("/admin/banners");
      router.refresh();
    } else {
      alert("Xatolik: " + res.error);
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 border border-border p-6 md:p-8 rounded-xl shadow-sm space-y-8">
      
      <div className="space-y-4">
        <Label className="text-sm font-semibold text-foreground">Banner Rasmi</Label>
        
        {isCropping && imgSrc ? (
          <div className="space-y-4 p-4 border rounded-xl bg-muted/50">
            <div className="text-sm font-medium mb-2 text-muted-foreground text-center">
              Kerakli qismini ajratib oling
            </div>
            <div className="flex justify-center border border-dashed border-primary/50 bg-white p-2">
              <ReactCrop
                crop={crop}
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                onComplete={(c) => setCompletedCrop(c)}
              >
                <img
                  ref={imgRef}
                  alt="Crop me"
                  src={imgSrc}
                  className="max-h-[400px] w-auto"
                />
              </ReactCrop>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsCropping(false)}>Bekor qilish</Button>
              <Button type="button" onClick={handleApplyCrop} disabled={isUploading || !completedCrop?.width}>
                {isUploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CropIcon className="w-4 h-4 mr-2" />}
                Qirqish va Yuklash
              </Button>
            </div>
          </div>
        ) : (
          <div className="relative bg-muted border-2 border-dashed border-border rounded-xl flex items-center justify-center overflow-hidden hover:bg-muted/80 transition-colors cursor-pointer group p-8 min-h-[250px]">
            {imageUrl ? (
              <div className="relative w-full text-center flex items-center justify-center">
                 <img src={imageUrl} alt="Banner" className="max-h-[300px] w-auto border rounded shadow-sm" />
                 <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-medium">
                    Boshqa rasm tanlash
                 </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-muted-foreground">
                <ImageIcon className="w-12 h-12 mb-3 opacity-50" />
                <span className="text-sm font-medium">Rasm tanlash uchun bosing</span>
              </div>
            )}
            <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/*" onChange={onSelectFile} disabled={isUploading} />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-primary">Sarlavha (Title) - Ixtiyoriy</Label>
          <Input 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            placeholder="Masalan: Uy Sell Premium" 
            className="h-12 bg-background"
          />
          <p className="text-xs text-muted-foreground">Banner ustida chiqadigan katta matn.</p>
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-semibold">Tavsif (Subtext) - Ixtiyoriy</Label>
          <Input 
            value={subtext} 
            onChange={(e) => setSubtext(e.target.value)} 
            placeholder="Masalan: Eng yaxshi uylar bizda" 
            className="h-12 bg-background"
          />
          <p className="text-xs text-muted-foreground">Sarlavha ostidagi kichikroq matn.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <Label className="text-sm font-semibold">Tugma matni (Button Text)</Label>
          <Input 
            value={buttonText} 
            onChange={(e) => setButtonText(e.target.value)} 
            placeholder="Masalan: Batafsil" 
            className="h-12 bg-background"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-semibold">Fon rangi (Background Color)</Label>
          <div className="flex gap-2">
            <Input 
              type="color"
              value={bgColor} 
              onChange={(e) => setBgColor(e.target.value)} 
              className="w-12 h-12 p-1 bg-background"
            />
            <Input 
              value={bgColor} 
              onChange={(e) => setBgColor(e.target.value)} 
              className="h-12 flex-1 bg-background font-mono"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-semibold">Fon naqshi (Pattern)</Label>
          <select 
            value={bgPattern} 
            onChange={(e) => setBgPattern(e.target.value)}
            className="h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">Yo'q</option>
            <option value="grid">Grid (To'r)</option>
            <option value="dots">Dots (Nuqtalar)</option>
            <option value="waves">Waves (To'lqinlar)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-2 border-b border-border mb-6">
        <div className="space-y-2">
          <Label className="text-sm font-semibold">Qanday kenglikda chiqishi kerak? (Kengligi)</Label>
          <Input 
            value={width} 
            onChange={(e) => setWidth(e.target.value)} 
            placeholder="Masalan: 100%, 1200px" 
            className="h-12 bg-background font-mono"
          />
          <p className="text-xs text-muted-foreground">Odatda <b>100%</b> tursa to'liq ekran kengligida chiqadi.</p>
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-semibold">Qanday balandlikda chiqishi kerak? (Bo'yi)</Label>
          <Input 
            value={height} 
            onChange={(e) => setHeight(e.target.value)} 
            placeholder="Masalan: 400px, 300px, auto" 
            className="h-12 bg-background font-mono"
          />
          <p className="text-xs text-muted-foreground">Banner necha piksel balandlikda turishini xohlaysiz (Masalan: <b>350px</b> yoki <b>400px</b>).</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label className="text-sm font-semibold">Ulanish havolasi (Link) - Ixtiyoriy</Label>
          <Input 
            value={link} 
            onChange={(e) => setLink(e.target.value)} 
            placeholder="https://example.com/aksiya" 
            className="h-12 bg-background"
          />
          <p className="text-xs text-muted-foreground">Agar foydalanuvchi bannerga bossa, shu manzilga o'tadi.</p>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-semibold">Necha soniya ko'rsatilsin? (Tezlik)</Label>
          <Input 
            type="number" 
            value={duration} 
            onChange={(e) => setDuration(e.target.value)} 
            className="h-12 bg-background font-mono"
            min="1"
          />
          <p className="text-xs text-muted-foreground">Odatda <b>3</b> soniya ko'rsatiladi.</p>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-semibold">Tartib raqami</Label>
        <Input 
          type="number" 
          value={order} 
          onChange={(e) => setOrder(e.target.value)} 
          className="h-12 bg-background"
          min="0"
        />
        <p className="text-xs text-muted-foreground">Kichik raqamli bannerlar birinchi bo'lib ko'rsatiladi.</p>
      </div>

      <div className="pt-6 border-t border-border flex justify-end">
        <Button type="submit" size="lg" className="h-14 px-10 font-bold bg-primary uppercase tracking-wider" disabled={isSubmitting || isUploading || !imageUrl}>
          {isSubmitting && <Loader2 className="w-5 h-5 mr-2 animate-spin" />}
          {isEdit ? "O'zgarishlarni Saqlash" : "Bannerni Saqlash"}
        </Button>
      </div>
    </form>
  );
}
