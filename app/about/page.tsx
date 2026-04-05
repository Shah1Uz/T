"use client";

import { useLocale } from "@/context/locale-context";
import { 
  ArrowRight, 
  Hammer, 
  Leaf, 
  Maximize2, 
  Moon, 
  MessageSquare, 
  UserPlus, 
  Upload, 
  ShieldCheck,
  Check,
  Building2,
  Users,
  BadgeCheck,
  Sparkles
} from "lucide-react";
import { UserButton, SignInButton, useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AboutPage() {
  const { t, locale } = useLocale();
  const { userId } = useAuth();

  const steps = [
    { title: t("about.step_1_title"), desc: t("about.step_1_desc"), icon: UserPlus, accent: "bg-blue-500/10 text-blue-500" },
    { title: t("about.step_2_title"), desc: t("about.step_2_desc"), icon: Upload, accent: "bg-orange-500/10 text-orange-500" },
    { title: t("about.step_3_title"), desc: t("about.step_3_desc"), icon: MessageSquare, accent: "bg-emerald-500/10 text-emerald-500" },
  ];

  const features = [
    { title: t("about.feat_gallery_title"), desc: t("about.feat_gallery_desc"), icon: Maximize2 },
    { title: t("about.feat_repair_title"), desc: t("about.feat_repair_desc"), icon: Hammer },
    { title: t("about.feat_eco_title"), desc: t("about.feat_eco_desc"), icon: Leaf },
    { title: t("about.feat_dark_title"), desc: t("about.feat_dark_desc"), icon: Moon },
    { title: t("about.feat_chat_title"), desc: t("about.feat_chat_desc"), icon: MessageSquare },
    { title: locale === "uz" ? "Ishonch va Xavfsizlik" : "Доверие и Безопасность", desc: locale === "uz" ? "Har bir e'lon va foydalanuvchi bizning filtrimizdan o'tadi." : "Каждое объявление и пользователь проходят через наш фильтр.", icon: ShieldCheck },
  ];

  return (
    <div className="bg-background text-foreground selection:bg-primary selection:text-white overflow-hidden">
      {/* --- HERO SECTION (Refined Minimalist) --- */}
      <section className="relative py-4 lg:py-8 border-b border-border/40 overflow-hidden">
        {/* Subtle Background pattern */}
        <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none">
          <svg width="100%" height="100%">
            <pattern id="dot-pattern" width="30" height="30" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.5" fill="currentColor" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#dot-pattern)" />
          </svg>
        </div>
        
        <div className="container relative z-10 px-4 mx-auto">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-2">
              <div className="h-64 w-64 md:h-80 md:w-80 relative animate-fade-in-up">
                <img src="/logo.png" alt="Logo" className="object-contain w-full h-full drop-shadow-2xl" />
              </div>
            </div>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight mb-8 leading-[0.95] text-foreground transition-all">
               <span className="text-primary italic">{t("about.title")}</span>
            </h1>
            
            <p className="max-w-2xl mx-auto text-muted-foreground text-lg md:text-xl font-medium leading-relaxed mb-12">
              {t("about.subtitle")}
            </p>
            
            <div className="flex flex-wrap justify-center gap-5">
               {userId ? (
                 <Button size="lg" className="rounded-2xl px-10 font-bold h-16 text-lg shadow-2xl shadow-primary/20 hover:scale-105 transition-transform duration-300" asChild>
                   <Link href="/">{locale === "uz" ? "Boshlash" : "Начать"}</Link>
                 </Button>
               ) : (
                 <SignInButton mode="modal">
                   <Button size="lg" className="rounded-2xl px-10 font-bold h-16 text-lg shadow-2xl shadow-primary/20 hover:scale-105 transition-transform duration-300">
                     {locale === "uz" ? "Boshlash" : "Начать"}
                   </Button>
                 </SignInButton>
               )}
               <Button variant="outline" size="lg" className="rounded-2xl px-10 font-bold h-16 text-lg border-2 hover:bg-muted/50 transition-all">
                 {locale === "uz" ? "Tanishish" : "Знакомство"}
               </Button>
            </div>
          </div>
        </div>
      </section>

      {/* --- HOW IT WORKS (Integrated UX) --- */}
      <section className="py-32 container px-4">
        <div className="flex flex-col lg:flex-row gap-20 items-center lg:items-start">
          <div className="lg:w-1/2">
             <div className="sticky top-32">
                <h2 className="text-4xl md:text-5xl font-black mb-8 tracking-tight">{t("about.how_it_works")}</h2>
                <p className="text-xl text-muted-foreground leading-relaxed font-normal max-w-lg mb-12">
                  {t("about.how_it_works_desc")}
                </p>
                
                <div className="grid grid-cols-2 gap-4">
                   <div className="p-8 rounded-[32px] bg-muted/30 border border-border/60 hover:border-primary/20 transition-colors">
                      <div className="text-4xl font-black mb-1 text-primary">12k+</div>
                      <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{locale === "uz" ? "Faol uylar" : "Активные дома"}</div>
                   </div>
                   <div className="p-8 rounded-[32px] bg-muted/30 border border-border/60 hover:border-primary/20 transition-colors">
                      <div className="text-4xl font-black mb-1 text-primary">24/7</div>
                      <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{locale === "uz" ? "Yordam" : "Поддержка"}</div>
                   </div>
                </div>
             </div>
          </div>

          <div className="lg:w-1/2 space-y-8">
            {steps.map((step, i) => (
              <div key={i} className="group p-8 md:p-12 rounded-[40px] border border-border/50 hover:border-primary/30 bg-background hover:bg-muted/10 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5">
                <div className="flex flex-col md:flex-row gap-8 items-start">
                  <div className={`h-16 w-16 rounded-2xl ${step.accent} flex items-center justify-center shrink-0 text-2xl font-black transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3`}>
                    {i + 1}
                  </div>
                  <div>
                    <h3 className="text-2xl font-black mb-4 flex items-center gap-3">
                      {step.title}
                    </h3>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- FEATURES (Cards UX) --- */}
      <section className="py-32 bg-slate-50 dark:bg-slate-900/10 border-y border-border/40">
        <div className="container px-4">
          <div className="text-center mb-20">
             <h2 className="text-4xl font-black mb-6 tracking-tight">{t("about.features_title")}</h2>
             <p className="text-muted-foreground font-medium max-w-xl mx-auto">{locale === "uz" ? "UY SELL — bu shunchaki e'lonlar doskasi emas, bu ko'chmas mulk olamidagi sizning aqlli yordamchingiz." : "UY SELL — это не просто доска объявлений, это ваш умный помощник в мире недвижимости."}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat, i) => (
              <div key={i} className="relative p-10 rounded-[40px] bg-background border border-border/80 hover:border-primary/40 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.08)] group overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-10 transition-opacity">
                   <feat.icon className="h-20 w-20 text-primary" />
                </div>
                <div className="h-14 w-14 rounded-2xl bg-muted/50 text-primary flex items-center justify-center mb-8 group-hover:bg-primary group-hover:text-white transition-all duration-500">
                  <feat.icon className="h-7 w-7" />
                </div>
                <h3 className="text-2xl font-black mb-4 tracking-tight">{feat.title}</h3>
                <p className="text-muted-foreground leading-relaxed font-medium mb-4">{feat.desc}</p>
                <div className="flex items-center gap-2 text-primary text-sm font-bold opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                   {locale === "uz" ? "Batafsil" : "Подробнее"} <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- MISSION (Premium Minimal) --- */}
      <section className="py-40 container px-4 text-center">
         <div className="max-w-4xl mx-auto relative group">
            <div className="absolute -inset-4 bg-gradient-to-r from-primary/5 to-primary/10 rounded-[50px] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            <div className="relative">
               <div className="inline-flex items-center justify-center h-20 w-20 bg-primary/10 rounded-[28px] text-primary mb-12">
                  <BadgeCheck className="h-10 w-10" />
               </div>
               <h2 className="text-4xl md:text-6xl font-black mb-10 tracking-tight leading-tight">
                 {t("about.mission_title")}
               </h2>
               <p className="text-muted-foreground text-xl md:text-2xl leading-relaxed italic mb-16">
                 "{t("about.mission_desc")}"
               </p>
               
               <div className="flex items-center justify-center gap-12 border-t border-border pt-16 grayscale hover:grayscale-0 transition-all duration-500">
                   <div className="flex items-center gap-3">
                      <Users className="h-6 w-6 text-primary" />
                      <div className="text-left">
                         <div className="font-black text-2xl">10k+</div>
                         <div className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Members</div>
                      </div>
                   </div>
                   <div className="h-12 w-px bg-border hidden sm:block" />
                   <div className="flex items-center gap-3">
                      <Building2 className="h-6 w-6 text-primary" />
                      <div className="text-left">
                         <div className="font-black text-2xl">50+</div>
                         <div className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Partners</div>
                      </div>
                   </div>
               </div>
            </div>
         </div>
      </section>

      {/* --- REFINED FOOTER --- */}
      <footer className="py-20 bg-slate-50 dark:bg-transparent border-t border-border/40">
        <div className="container px-4">
           <div className="flex flex-col md:flex-row justify-between items-center gap-12">
               <div className="flex items-center">
                  <div className="h-48 w-48 relative group-hover:scale-105 transition-transform duration-300">
                    <img 
                      src="/logo.png" 
                      alt="UY SELL" 
                      className="object-contain w-full h-full"
                    />
                  </div>
               </div>
              <p className="text-muted-foreground font-bold text-sm tracking-tight text-center md:text-left">
                © 2026 UY SELL LUXURY REAL ESTATE PORTAL. ALL RIGHTS RESERVED.
              </p>
              <div className="flex gap-8 font-black text-xs uppercase tracking-[0.2em]">
                 <Link href="/" className="hover:text-primary transition-colors">Find</Link>
                 <Link href="/about" className="text-primary underline underline-offset-8">About</Link>
                 <Link href="/jurnal" className="hover:text-primary transition-colors">Legal</Link>
              </div>
           </div>
        </div>
      </footer>

      <style jsx global>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
