"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { UserButton, SignInButton, SignUpButton, useAuth, useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { 
  Home, 
  PlusSquare, 
  Heart, 
  MessageSquare, 
  Zap, 
  LayoutDashboard, 
  Menu, 
  X, 
  Building2, 
  ShieldCheck, 
  Map as MapIcon, 
  Bell, 
  BookOpen, 
  ChevronDown, 
  Rocket, 
  Info, 
  Star,
  Search,
  HelpCircle
} from "lucide-react";
import { useLocale } from "@/context/locale-context";
import NotificationBell from "./notification-bell";
import { ThemeToggle } from "./theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const { userId, isLoaded } = useAuth();
  const { user } = useUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { locale, setLocale, t } = useLocale();
  const pathname = usePathname();
  const isAdmin = user?.primaryEmailAddress?.emailAddress === "shahuztech@gmail.com";

  useEffect(() => { setMounted(true); }, []);

  if (pathname === "/") return null;

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-[100] w-full border-b border-border/10 bg-white/80 dark:bg-slate-950/80 backdrop-blur-2xl shadow-sm" suppressHydrationWarning>
        <div suppressHydrationWarning className="container flex h-[68px] 3xl:h-[100px] items-center justify-between">
          
          <div className="flex items-center gap-8 3xl:gap-16">
            <Link href="/" className="relative flex items-center shrink-0 group outline-none h-full">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 h-32 w-32 3xl:h-44 3xl:w-44 z-10 group-hover:scale-105 transition-transform duration-300">
                <img 
                  src="/logo.png" 
                  alt="UY SELL" 
                  className="object-contain w-full h-full drop-shadow-xl"
                />
              </div>
              <div className="h-[68px] w-32 3xl:h-[100px] 3xl:w-44" />
            </Link>

            <nav className="hidden lg:flex items-center gap-1">
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <div className="h-10 px-4 rounded-xl font-bold flex items-center gap-2 transition-all cursor-pointer select-none hover:bg-primary/5 text-foreground hover:text-primary group">
                    <Search className="h-4 w-4 opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all text-primary" />
                    {locale === "uz" ? "Qidiruv" : "Поиск"}
                    <ChevronDown className="h-3.5 w-3.5 opacity-50 transition-transform group-hover:rotate-180" />
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-[220px] p-2 mt-2 rounded-2xl shadow-2xl border-border/50 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200">
                  <DropdownMenuItem>
                    <Link href="/" className="flex items-center gap-2.5 p-3 rounded-xl cursor-pointer w-full text-foreground hover:bg-primary/5 hover:text-primary transition-colors">
                      <div className="h-8 w-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                        <Home className="h-4 w-4" />
                      </div>
                      <span className="font-semibold">{t("nav.new_buildings")}</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href="/ikkilamchi" className="flex items-center gap-2.5 p-3 rounded-xl cursor-pointer w-full text-foreground hover:bg-primary/5 hover:text-primary transition-colors">
                      <div className="h-8 w-8 rounded-lg bg-orange-50 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400">
                        <Building2 className="h-4 w-4" />
                      </div>
                      <span className="font-semibold">{t("nav.secondary")}</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href="/map" className="flex items-center gap-2.5 p-3 rounded-xl cursor-pointer w-full text-foreground hover:bg-primary/5 hover:text-primary transition-colors">
                      <div className="h-8 w-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                        <MapIcon className="h-4 w-4" />
                      </div>
                      <span className="font-semibold">{locale === "uz" ? "Xarita orqali" : "На карте"}</span>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger>
                  <div className="h-10 px-4 rounded-xl font-bold flex items-center gap-2 transition-all cursor-pointer select-none hover:bg-primary/5 text-foreground hover:text-primary group">
                    <Rocket className="h-4 w-4 opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all text-primary" />
                    {locale === "uz" ? "Xizmatlar" : "Сервисы"}
                    <ChevronDown className="h-3.5 w-3.5 opacity-50" />
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-[220px] p-2 mt-2 rounded-2xl shadow-2xl border-border/50 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200">
                  <DropdownMenuItem>
                    <Link href="/pricing" className="flex items-center gap-2.5 p-3 rounded-xl cursor-pointer w-full text-foreground hover:bg-primary/5 hover:text-primary transition-colors">
                      <div className="h-8 w-8 rounded-lg bg-yellow-50 dark:bg-yellow-900/30 flex items-center justify-center text-yellow-600 dark:text-yellow-400">
                        <Rocket className="h-4 w-4" />
                      </div>
                      <span className="font-semibold">{locale === "uz" ? "Tariflar" : "Таrifы"}</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href="/top-sellers" className="flex items-center gap-2.5 p-3 rounded-xl cursor-pointer w-full text-foreground hover:bg-primary/5 hover:text-primary transition-colors">
                      <div className="h-8 w-8 rounded-lg bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                        <Star className="h-4 w-4" />
                      </div>
                      <span className="font-semibold">{locale === "uz" ? "Top Sotuvchilar" : "Топ Продавцы"}</span>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger>
                  <div className="h-10 px-4 rounded-xl font-bold flex items-center gap-2 transition-all cursor-pointer select-none hover:bg-primary/5 text-foreground hover:text-primary group">
                    <HelpCircle className="h-4 w-4 opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all text-primary" />
                    {locale === "uz" ? "Ma'lumot" : "Информация"}
                    <ChevronDown className="h-3.5 w-3.5 opacity-50" />
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-[200px] p-2 mt-2 rounded-2xl shadow-2xl border-border/50 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200">
                  <DropdownMenuItem>
                    <Link href="/jurnal" className="flex items-center gap-2.5 p-3 rounded-xl cursor-pointer w-full text-foreground hover:bg-primary/5 hover:text-primary transition-colors">
                      <div className="h-8 w-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                        <BookOpen className="h-4 w-4" />
                      </div>
                      <span className="font-semibold">{t("nav.journal")}</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href="/about" className="flex items-center gap-2.5 p-3 rounded-xl cursor-pointer w-full text-foreground hover:bg-primary/5 hover:text-primary transition-colors">
                      <div className="h-8 w-8 rounded-lg bg-slate-50 dark:bg-slate-900/30 flex items-center justify-center text-slate-600 dark:text-slate-400">
                        <Info className="h-4 w-4" />
                      </div>
                      <span className="font-semibold">{t("nav.about")}</span>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-3 mr-1">
              {userId && (
                <Button asChild className="h-10 px-5 rounded-xl font-bold bg-primary text-primary-foreground hover:opacity-90 shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95 mr-2">
                  <Link href="/listings/create" className="flex items-center gap-2">
                    <PlusSquare className="h-5 w-5" />
                    {t("nav.add_listing")}
                  </Link>
                </Button>
              )}
              <button 
                onClick={() => setLocale(locale === "uz" ? "ru" : "uz")}
                className={cn(
                  "h-10 px-4 rounded-xl text-xs font-black transition-all border shrink-0 bg-muted/20 border-border/40 hover:border-primary/50 hover:bg-primary/5 hover:text-primary active:scale-95 shadow-sm group",
                )}
              >
                <span className={cn(locale === "uz" ? "text-primary" : "text-muted-foreground")}>UZ</span>
                <span className="mx-1 opacity-20 group-hover:opacity-40 transition-opacity">|</span>
                <span className={cn(locale === "ru" ? "text-primary" : "text-muted-foreground")}>RU</span>
              </button>
              <ThemeToggle />
              <NotificationBell />
            </div>

            <div className="flex items-center gap-2 sm:gap-3 mr-1">
              {pathname !== "/chat" && (
                <Link href="/chat" className="lg:hidden">
                  <div className="h-10 w-10 rounded-xl bg-muted/20 hover:bg-primary/10 hover:text-primary flex items-center justify-center cursor-pointer transition-all border border-border/40 relative group shadow-sm">
                    <MessageSquare className="h-5 w-5" />
                    <span className="sr-only">Chat</span>
                  </div>
                </Link>
              )}
              <Link href="/chat" className="hidden lg:block">
                <div className="h-10 w-10 rounded-xl bg-muted/20 hover:bg-primary/10 hover:text-primary flex items-center justify-center cursor-pointer transition-all border border-border/40 relative group shadow-sm">
                  <MessageSquare className="h-5 w-5" />
                  <span className="sr-only">Chat</span>
                </div>
              </Link>
            </div>

            {userId ? (
              <div className="flex items-center gap-3">
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <div className="h-10 w-10 rounded-full bg-muted/60 hover:bg-primary/10 hover:text-primary flex items-center justify-center cursor-pointer transition-all border border-border/40 relative group">
                      <LayoutDashboard className="h-5 w-5" />
                      {isAdmin && <div className="absolute -top-0.5 -right-0.5 h-3 w-3 bg-primary border-2 border-white dark:border-slate-950 rounded-full shadow-sm" />}
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[240px] p-2 mt-2 rounded-2xl shadow-2xl border-border/50 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200">
                    <DropdownMenuItem>
                      <Link href="/dashboard" className="flex items-center gap-3 p-3 rounded-xl cursor-pointer w-full text-foreground hover:bg-primary/5 hover:text-primary transition-all">
                        <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary">
                          <LayoutDashboard className="h-5 w-5" />
                        </div>
                        <span className="font-bold">{t("dashboard.title")}</span>
                      </Link>
                    </DropdownMenuItem>
                    {isAdmin && (
                      <DropdownMenuItem>
                        <Link href="/admin" className="flex items-center gap-3 p-3 rounded-xl cursor-pointer text-primary w-full hover:bg-primary/10 transition-all border border-primary/20 bg-primary/5 mt-1">
                          <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                            <ShieldCheck className="h-5 w-5" />
                          </div>
                          <span className="font-black italic tracking-tight uppercase">Dashboard Control</span>
                        </Link>
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
                <div className="h-10 w-10 rounded-full border-2 border-primary/20 bg-muted hover:border-primary transition-all shadow-sm flex items-center justify-center overflow-hidden">
                   <UserButton 
                    appearance={{
                      elements: {
                        avatarBox: "h-9 w-9",
                        userButtonTrigger: "h-9 w-9"
                      }
                    }}
                   />
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <SignInButton mode="modal">
                  <Button variant="ghost" className="hidden sm:flex h-10 px-4 rounded-xl font-bold hover:text-primary hover:bg-primary/5 transition-all">
                    {locale === "uz" ? "Kirish" : "Войти"}
                  </Button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <Button className="h-10 px-4 sm:px-6 rounded-xl font-bold bg-primary text-primary-foreground hover:opacity-90 shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95">
                    {locale === "uz" ? "Ro'yxatdan" : "Рег."}
                  </Button>
                </SignUpButton>
              </div>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden h-10 w-10 rounded-xl hover:bg-primary/5 hover:text-primary ml-1"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden overflow-hidden bg-white dark:bg-slate-950 border-t border-border/50"
            >
              <div className="container p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-xl tracking-tighter uppercase opacity-40">{locale === "uz" ? "Menu" : "Меню"}</h3>
                  <div className="flex items-center gap-3">
                    <ThemeToggle />
                    <button 
                      onClick={() => setLocale(locale === "uz" ? "ru" : "uz")}
                      className={cn(
                        "h-9 px-4 rounded-xl text-xs font-black transition-all border",
                        "bg-muted/50 border-border/40 hover:border-primary/50"
                      )}
                    >
                      {locale === "uz" ? "UZ" : "RU"}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                   <Link 
                    href="/" 
                    className="flex flex-col gap-2 p-4 rounded-2xl bg-primary/5 border border-primary/10 hover:bg-primary/10 transition-all group"
                    onClick={() => setMobileMenuOpen(false)}
                   >
                     <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                       <Home className="h-5 w-5" />
                     </div>
                     <span className="font-bold text-sm">{t("nav.new_buildings")}</span>
                   </Link>
                   <Link 
                    href="/ikkilamchi" 
                    className="flex flex-col gap-2 p-4 rounded-2xl bg-orange-500/5 border border-orange-500/10 hover:bg-orange-500/10 transition-all group"
                    onClick={() => setMobileMenuOpen(false)}
                   >
                     <div className="h-10 w-10 rounded-xl bg-orange-500/10 text-orange-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                       <Building2 className="h-5 w-5" />
                     </div>
                     <span className="font-bold text-sm">{t("nav.secondary")}</span>
                   </Link>
                </div>

                <div className="space-y-1">
                  <Link href="/chat" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-between p-4 rounded-xl hover:bg-primary/5 font-bold group border border-primary/10 bg-primary/5">
                    <div className="flex items-center gap-3">
                      <MessageSquare className="h-5 w-5 text-primary" />
                      <span className="text-primary">{locale === "uz" ? "Chat bo'limi" : "Раздел чата"}</span>
                    </div>
                    <ChevronDown className="h-4 w-4 -rotate-90 text-primary" />
                  </Link>
                  <Link href="/pricing" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-between p-4 rounded-xl hover:bg-primary/5 font-bold group">
                    <div className="flex items-center gap-3">
                      <Rocket className="h-5 w-5 text-primary" />
                      <span>{locale === "uz" ? "Tariflar" : "Taрифы"}</span>
                    </div>
                    <ChevronDown className="h-4 w-4 -rotate-90 opacity-40 group-hover:opacity-100 transition-opacity" />
                  </Link>
                  <Link href="/map" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-between p-4 rounded-xl hover:bg-primary/5 font-bold group">
                    <div className="flex items-center gap-3">
                      <MapIcon className="h-5 w-5 text-primary" />
                      <span>{locale === "uz" ? "Xarita orqali" : "На карте"}</span>
                    </div>
                    <ChevronDown className="h-4 w-4 -rotate-90 opacity-40 group-hover:opacity-100 transition-opacity" />
                  </Link>
                  <Link href="/top-sellers" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-between p-4 rounded-xl hover:bg-primary/5 font-bold group">
                    <div className="flex items-center gap-3">
                      <Star className="h-5 w-5 text-primary" />
                      <span>{locale === "uz" ? "Top Sotuvchilar" : "Топ Продавцы"}</span>
                    </div>
                    <ChevronDown className="h-4 w-4 -rotate-90 opacity-40 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </div>

                <div className="pt-2">
                   {userId ? (
                      <Button asChild className="w-full h-14 rounded-2xl font-black text-lg shadow-xl shadow-primary/20 bg-primary hover:scale-[1.02] active:scale-95 transition-all">
                        <Link href="/listings/create" onClick={() => setMobileMenuOpen(false)}>
                          <PlusSquare className="mr-2 h-6 w-6" />
                          {t("nav.add_listing")}
                        </Link>
                      </Button>
                   ) : (
                      <div className="grid grid-cols-2 gap-3">
                        <SignInButton mode="modal">
                          <Button variant="outline" className="h-14 rounded-2xl font-bold bg-muted/30" onClick={() => setMobileMenuOpen(false)}>
                            {locale === "uz" ? "Kirish" : "Войти"}
                          </Button>
                        </SignInButton>
                        <SignUpButton mode="modal">
                          <Button className="h-14 rounded-2xl font-bold font-black shadow-lg shadow-primary/20" onClick={() => setMobileMenuOpen(false)}>
                            {locale === "uz" ? "Ro'yxatdan" : "Рег."}
                          </Button>
                        </SignUpButton>
                      </div>
                   )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
      <div className="h-[68px] 3xl:h-[100px]" />
    </>
  );
}
