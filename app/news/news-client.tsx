"use client";

import { useLocale } from "@/context/locale-context";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { Calendar, ChevronRight, BookOpen } from "lucide-react";
import Link from "next/link";

export default function NewsClient({ news }: { news: any[] }) {
  const { locale } = useLocale();

  return (
    <div className="container py-12">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-bold border border-primary/20 shadow-sm">
            <BookOpen className="h-4 w-4" />
            <span className="uppercase tracking-widest text-xs">Uysell News</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-foreground tracking-tight">
            {locale === "uz" ? "Yangiliklar va Maqolalar" : "Новости и Статьи"}
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl font-medium">
            {locale === "uz" 
              ? "Ko'chmas mulk bozoridagi eng so'nggi xabarlar, ekspertlar fikri va foydali maslahatlar." 
              : "Последние новости на рынке недвижимости, мнения экспертов и полезные советы."}
          </p>
        </div>
      </div>

      {news.length === 0 ? (
        <div className="text-center py-20 bg-muted/20 rounded-3xl border border-border/50">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-bold text-muted-foreground">
            {locale === "uz" ? "Hozircha yangiliklar yo'q" : "Пока нет новостей"}
          </h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {news.map((post) => (
            <Link key={post.id} href={`/news/${post.id}`}>
              <Card className="group h-full overflow-hidden rounded-[32px] border-border/50 shadow-sm hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 cursor-pointer">
                <div className="relative h-60 w-full overflow-hidden">
                  <Image 
                    src={post.imageUrl || "/placeholder-property.jpg"} 
                    alt={locale === "uz" ? post.titleUz : post.titleRu} 
                    fill 
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl text-xs font-black text-foreground shadow-sm uppercase tracking-widest border border-border/50">
                      {locale === "uz" ? post.categoryUz : post.categoryRu}
                    </span>
                  </div>
                </div>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 text-muted-foreground text-xs font-bold uppercase tracking-widest mb-3 opacity-60">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{new Date(post.createdAt).toLocaleDateString(locale === "uz" ? "uz-UZ" : "ru-RU")}</span>
                  </div>
                  <h2 className="text-xl font-black text-foreground mb-3 group-hover:text-primary transition-colors leading-snug line-clamp-2">
                    {locale === "uz" ? post.titleUz : post.titleRu}
                  </h2>
                  <p className="text-muted-foreground text-[15px] mb-6 line-clamp-2 font-medium">
                    {locale === "uz" ? post.excerptUz : post.excerptRu}
                  </p>
                  
                  <div className="flex items-center text-primary font-bold gap-1 group/btn">
                    <span>{locale === "uz" ? "Batafsil o'qish" : "Читать далее"}</span>
                    <ChevronRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
