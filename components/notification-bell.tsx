"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { Bell, Tag, ChevronRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useLocale } from "@/context/locale-context";
import { formatDistanceToNow } from "date-fns";
import { uz, ru } from "date-fns/locale";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { PusherClient } from "@/lib/pusher-client";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  listingId: string | null;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationBell() {
  const { locale } = useLocale();
  const { userId, isLoaded } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async (isFirstLoad = false) => {
    if (typeof window !== "undefined" && !window.navigator.onLine) return;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    try {
      const res = await fetch("/api/notifications", { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!res.ok) {
        if (res.status === 401) return;
        return; // Silent for other errors during polling
      }

      const text = await res.text();
      if (!text) return;
      
      const data = JSON.parse(text);
      
      if (!isFirstLoad && Array.isArray(data)) {
        const currentIds = notifications.map(n => n.id);
        const hasNew = data.some((n: Notification) => !currentIds.includes(n.id) && !n.isRead);
        
        if (hasNew) {
          const audio = new Audio("https://www.myinstants.com/media/sounds/notification_o14egLP.mp3");
          audio.volume = 0.5;
          audio.play().catch(() => {});
        }
      }

      if (Array.isArray(data)) {
        setNotifications(data);
        setUnreadCount(data.filter((n: Notification) => !n.isRead).length);
      }
    } catch (e: any) {
      clearTimeout(timeoutId);
      
      // Silently handle fetch failures, timeouts, and aborts during polling
      const isNetworkError = e instanceof TypeError || e.name === "AbortError" || e.message?.includes("fetch");
      
      if (isNetworkError) {
        if (isFirstLoad) {
          console.warn("Initial notification fetch failed (Network/Timeout).");
        }
        return;
      }
      
      console.error("Notification fetch error:", e);
    }
  };

  useEffect(() => {
    if (!isLoaded || !userId) return;
    
    fetchNotifications(true);
    
    // Real-time notifications via Pusher
    const channel = PusherClient.subscribe(`user-${userId}`);
    channel.bind("notification", (newNotif: Notification) => {
      setNotifications(prev => [newNotif, ...prev]);
      setUnreadCount(prev => prev + 1);
      
      // Play sound
      const audio = new Audio("https://www.myinstants.com/media/sounds/notification_o14egLP.mp3");
      audio.volume = 0.5;
      audio.play().catch(() => {});
    });

    // Poll every 30 seconds as a fallback
    const interval = setInterval(() => fetchNotifications(false), 30000);
    
    return () => {
      clearInterval(interval);
      PusherClient.unsubscribe(`user-${userId}`);
    };
  }, [userId, isLoaded]);

  const markAsRead = async (id: string) => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        body: JSON.stringify({ id }),
      });
      setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-300">
          <Bell className="h-[18px] w-[18px]" />
          <AnimatePresence>
            {unreadCount > 0 && (
              <motion.span 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute -top-0.5 -right-0.5 h-4 w-4 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-background dark:border-slate-950"
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </motion.span>
            )}
          </AnimatePresence>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 sm:w-96 p-0 bg-popover/95 backdrop-blur-xl border-none shadow-2xl rounded-[24px] overflow-hidden" align="end">
        <div className="p-4 border-b flex items-center justify-between bg-muted/30">
          <h3 className="font-black text-sm uppercase tracking-widest pl-2">
            {locale === "uz" ? "Bildirishnomalar" : "Уведомления"}
          </h3>
          {unreadCount > 0 && (
            <div className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full uppercase tracking-tighter">
              {unreadCount} New
            </div>
          )}
        </div>
        <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
          {notifications.length === 0 ? (
            <div className="py-12 px-6 text-center">
              <div className="h-12 w-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                <Bell className="h-5 w-5 text-muted-foreground opacity-30" />
              </div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest leading-relaxed">
                {locale === "uz" ? "Hozircha xabarlar yo'q" : "Сообщений пока нет"}
              </p>
            </div>
          ) : (
            notifications.map((n) => (
              <div 
                key={n.id} 
                className={`relative p-4 border-b flex gap-3 hover:bg-muted/30 transition-colors group cursor-pointer ${!n.isRead ? "bg-primary/5 shadow-inner" : ""}`}
                onClick={() => {
                  if (!n.isRead) markAsRead(n.id);
                  if (n.listingId) router.push(`/listings/${n.listingId}`);
                }}
              >
                <div className={`mt-0.5 h-9 w-9 rounded-xl shrink-0 flex items-center justify-center ${n.type === 'price_drop' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-blue-500/10 text-blue-600'}`}>
                  {n.type === 'price_drop' ? <Tag className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
                </div>
                <div className="flex-1 space-y-1 pr-6">
                  <div className="flex items-center justify-between">
                    <p className={`text-[13px] font-black leading-none ${!n.isRead ? "text-foreground" : "text-muted-foreground"}`}>
                      {n.title}
                    </p>
                    <span className="text-[10px] font-bold text-muted-foreground whitespace-nowrap">
                      {formatDistanceToNow(new Date(n.createdAt), { 
                        addSuffix: true, 
                        locale: locale === 'uz' ? uz : ru 
                      })}
                    </span>
                  </div>
                  <p className="text-[12px] font-medium leading-tight text-muted-foreground/80 line-clamp-2">
                    {n.message}
                  </p>
                  {n.listingId && (
                    <Link 
                      href={`/listings/${n.listingId}`}
                      className="inline-flex items-center text-[10px] font-black text-primary uppercase tracking-widest mt-1 hover:underline group/link"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {locale === "uz" ? "Ko'rish" : "Посмотреть"}
                      <ChevronRight className="h-3 w-3 ml-0.5 group-hover/link:translate-x-0.5 transition-transform" />
                    </Link>
                  )}
                </div>
                {!n.isRead && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-primary" />
                )}
              </div>
            ))
          )}
        </div>
        {notifications.length > 0 && (
          <div className="p-3 bg-muted/20 border-t flex justify-center">
            <button className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">
              {locale === "uz" ? "Barchasini ko'rish" : "Посмотреть все"}
            </button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
