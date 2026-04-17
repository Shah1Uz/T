"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowLeft, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import { createStoryAction } from "@/server/actions/story.action";

export default function StoryForm() {
  const router = useRouter();
  const [imageUrl, setImageUrl] = useState<string>("");
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleFileUpload(file: File) {
    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      
      if (file.type.startsWith("video/")) {
        setVideoUrl(data.url);
        setImageUrl("");
      } else {
        setImageUrl(data.url);
        setVideoUrl("");
      }
    } catch (error) {
      alert("Fayl yuklashda xatolik yuz berdi");
    } finally {
      setIsUploading(false);
    }
  }

  function onSelectFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    handleFileUpload(file);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl && !videoUrl) {
      alert("Iltimos, rasm yoki video yuklang");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await createStoryAction({ imageUrl, videoUrl });
      if (res.success) {
        router.push("/admin/stories");
        router.refresh();
      } else {
        alert("Xatolik: " + res.error);
        setIsSubmitting(false);
      }
    } catch (error) {
      alert("Xatolik yuz berdi");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon" className="rounded-xl">
          <Link href="/admin/stories">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <h2 className="text-3xl font-black tracking-tight">Yangi Hikoya</h2>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 border border-border p-8 rounded-3xl shadow-xl space-y-8">
        <div className="space-y-4">
          <Label className="text-base font-black text-foreground uppercase tracking-wider">Hikoya Mazmuni (Rasm yoki Video)</Label>
          
          <div className="relative bg-muted/30 border-2 border-dashed border-border rounded-3xl flex items-center justify-center overflow-hidden hover:bg-muted/50 transition-all cursor-pointer group min-h-[400px]">
            {isUploading ? (
              <div className="flex flex-col items-center gap-4">
                  <Loader2 className="w-12 h-12 text-primary animate-spin" />
                  <span className="font-bold text-primary animate-pulse tracking-widest uppercase text-xs">Yuklanmoqda...</span>
              </div>
            ) : imageUrl || videoUrl ? (
              <div className="relative w-full h-full group">
                {videoUrl ? (
                  <video src={videoUrl} className="max-h-[500px] w-full object-contain bg-black" controls />
                ) : (
                  <img src={imageUrl} alt="Story preview" className="max-h-[500px] w-full object-contain" />
                )}
                
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                  <div className="flex flex-col items-center gap-3">
                      <p className="text-white font-black uppercase tracking-widest text-sm">O'zgartirish uchun bosing</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-muted-foreground p-10 space-y-4">
                <div className="w-20 h-20 bg-background rounded-full flex items-center justify-center shadow-lg border border-border group-hover:scale-110 transition-transform">
                  <ImageIcon className="w-10 h-10 text-primary opacity-50" />
                </div>
                <div className="text-center">
                  <span className="text-lg font-black block text-foreground uppercase tracking-tight">Faylni tanlang</span>
                  <span className="text-sm font-medium opacity-60">Rasm yoki Video</span>
                </div>
              </div>
            )}
            <input 
              type="file" 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
              accept="image/*,video/*" 
              onChange={onSelectFile} 
              disabled={isUploading} 
            />
          </div>
        </div>

        <div className="pt-4">
           <Button 
              type="submit" 
              size="lg" 
              className="w-full h-16 rounded-2xl font-black text-lg bg-primary uppercase tracking-[0.1em] shadow-2xl shadow-primary/30 transition-all active:scale-95 disabled:opacity-50" 
              disabled={isSubmitting || isUploading || (!imageUrl && !videoUrl)}
           >
              {isSubmitting && <Loader2 className="w-6 h-6 mr-3 animate-spin" />}
              Hikoyani Chop Etish
           </Button>
        </div>
      </form>
    </div>
  );
}
