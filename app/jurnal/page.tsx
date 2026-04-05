"use client";

import { useLocale } from "@/context/locale-context";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { Calendar, ChevronRight, BookOpen } from "lucide-react";

const BLOG_POSTS = [
  {
    id: 1,
    title: { uz: "Toshkentda uy narxlari 2026-yilda qanday o'zgaradi?", ru: "Как изменятся цены на жилье в Ташкенте в 2026 году?" },
    excerpt: { uz: "Ko'chmas mulk bozori mutaxassislaridan tahliliy maqola va bashoratlar.", ru: "Аналитическая статья и прогнозы экспертов рынка недвижимости." },
    image: "https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=800&q=80",
    date: "12 Mart, 2026",
    category: { uz: "Bozor tahlili", ru: "Анализ рынка" }
  },
  {
    id: 2,
    title: { uz: "Yangi uy sotib olishda nimalarga e'tibor berish kerak?", ru: "На что обратить внимание при покупке нового дома?" },
    excerpt: { uz: "Firibgarlardan saqlanish va to'g'ri tanlov qilish bo'yicha amaliy maslahatlar.", ru: "Практические советы о том, как избежать мошенничества и сделать правильный выбор." },
    image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80",
    date: "08 Mart, 2026",
    category: { uz: "Maslahatlar", ru: "Советы" }
  }
];

export default function JurnalPage() {
  const { locale, t } = useLocale();

  return (
    <div className="container py-12">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-bold border border-primary/20">
            <BookOpen className="h-4 w-4" />
            <span>UY SELL Jurnali</span>

          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-foreground tracking-tight">{t("jurnal.title")}</h1>
          <p className="text-muted-foreground text-lg max-w-2xl font-medium">{t("jurnal.subtitle")}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {BLOG_POSTS.map((post) => (
          <Card key={post.id} className="group overflow-hidden rounded-[24px] border-border/50 shadow-sm hover:shadow-xl transition-all duration-500 cursor-pointer">
            <div className="relative h-60 w-full overflow-hidden">
              <Image 
                src={post.image} 
                alt={post.title[locale]} 
                fill 
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute top-4 left-4">
                <span className="bg-background/90 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-bold text-foreground shadow-sm uppercase tracking-wider">{post.category[locale]}</span>
              </div>
            </div>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-3">
                <Calendar className="h-4 w-4" />
                <span>{post.date}</span>
              </div>
              <h2 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors leading-snug">{post.title[locale]}</h2>
              <p className="text-muted-foreground text-[15px] mb-6 line-clamp-2 font-medium">{post.excerpt[locale]}</p>
              
              <div className="flex items-center text-primary font-bold gap-1 group/btn">
                <span>{t("common.details")}</span>
                <ChevronRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
