"use client";

import { useLocale } from "@/context/locale-context";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Calendar, BookOpen } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NewsDetailClient({ newsItem }: { newsItem: any }) {
  const { locale } = useLocale();
  const router = useRouter();

  if (!newsItem) return null;

  const title = locale === "uz" ? newsItem.titleUz : newsItem.titleRu;
  const category = locale === "uz" ? newsItem.categoryUz : newsItem.categoryRu;
  const content = locale === "uz" ? newsItem.contentUz : newsItem.contentRu;
  const excerpt = locale === "uz" ? newsItem.excerptUz : newsItem.excerptRu;

  return (
    <div className="container py-12 max-w-4xl">
      <Button 
        variant="ghost" 
        className="mb-8 hover:bg-primary/5 text-muted-foreground hover:text-primary transition-colors gap-2"
        onClick={() => router.back()}
      >
        <ChevronLeft className="h-4 w-4" />
        {locale === "uz" ? "Orqaga qaytish" : "Назад"}
      </Button>

      <div className="space-y-8">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-bold border border-primary/20 shadow-sm">
            <BookOpen className="h-4 w-4" />
            <span className="uppercase tracking-widest text-xs">{category}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-foreground tracking-tight leading-tight">
            {title}
          </h1>
          <div className="flex items-center gap-2 text-muted-foreground text-sm font-bold uppercase tracking-widest opacity-60">
            <Calendar className="h-4 w-4" />
            <span>{new Date(newsItem.createdAt).toLocaleDateString(locale === "uz" ? "uz-UZ" : "ru-RU")}</span>
          </div>
        </div>

        <div className="relative aspect-video w-full overflow-hidden rounded-[32px] border border-border/50 shadow-2xl">
          <Image 
            src={newsItem.imageUrl || "/placeholder-property.jpg"} 
            alt={title} 
            fill 
            className="object-cover"
            priority
          />
        </div>

        <div className="prose prose-lg dark:prose-invert max-w-none">
          {content ? (
            <div className="text-foreground/90 leading-relaxed font-medium whitespace-pre-wrap">
              {content}
            </div>
          ) : (
            <div className="text-foreground/90 leading-relaxed font-medium italic">
              {excerpt}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
