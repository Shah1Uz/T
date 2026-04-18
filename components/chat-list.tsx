"use client";

import { useUser } from "@clerk/nextjs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Image as ImageIcon, Video, Mic } from "lucide-react";
import Link from "next/link";
import { useLocale } from "@/context/locale-context";
import { cn } from "@/lib/utils";

import { useState, useEffect } from "react";

interface ChatListProps {
  chats: any[];
  activeChatId?: string | null;
}

export function ChatList({ chats: initialChats, activeChatId }: ChatListProps) {
  const { user } = useUser();
  const { t, locale } = useLocale();
  const [chats, setChats] = useState(initialChats);

  useEffect(() => {
    setChats(initialChats);
  }, [initialChats]);

  useEffect(() => {
    const handleChatUpdate = (event: any) => {
      const { detail } = event;
      console.log("ChatList received update:", detail);
      
      // Refresh chats from API to get the correct order and unread count
      fetch("/api/chat")
        .then(res => res.json())
        .then(data => setChats(data))
        .catch(err => console.error("Error refreshing chats:", err));
    };

    window.addEventListener("chat-updated", handleChatUpdate);
    return () => window.removeEventListener("chat-updated", handleChatUpdate);
  }, []);

  return (
    <div className="flex flex-col h-full bg-background dark:bg-slate-950">
      <div className="px-6 py-5 border-b border-border/50 bg-card/50 backdrop-blur-md sticky top-0 z-10">
        <h2 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-2">
          {t("chat.title")}
          <span className="h-6 px-2 rounded-full bg-primary/10 text-primary text-[12px] font-black flex items-center justify-center shadow-inner">
            {chats.length}
          </span>
        </h2>
      </div>
      
      <ScrollArea className="flex-1">
        {chats.length > 0 ? (
          <div className="p-3 space-y-2">
            {chats.map((chat) => {
              const otherParticipant = chat.participants.find((p: any) => p.userId !== user?.id);
              const lastMessage = chat.messages?.[0];
              const isActive = activeChatId === chat.id;

              return (
                <Link 
                  key={chat.id} 
                  href={`/chat?id=${chat.id}`}
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-[24px] transition-all duration-300 cursor-pointer group relative overflow-hidden",
                    isActive 
                      ? "bg-card shadow-xl shadow-primary/5 border-primary/20 scale-[1.02] z-10" 
                      : "hover:bg-card/80 border border-transparent"
                  )}
                >
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-10 bg-primary rounded-r-full" />
                  )}
                  
                  <div className="relative shrink-0">
                    <Avatar className="h-14 w-14 border-2 border-background shadow-md transition-transform duration-300 group-hover:scale-110">
                      <AvatarImage src={otherParticipant?.user?.imageUrl} className="object-cover" />
                      <AvatarFallback className="bg-primary/5 text-primary font-black text-lg">
                        {otherParticipant?.userId.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {/* Status indicator can be added here if available */}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <span className="font-bold text-foreground truncate group-hover:text-primary transition-colors">
                        {otherParticipant?.user?.name || (locale === "uz" ? "Foydalanuvchi" : "Пользователь")}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-black uppercase tracking-tighter shrink-0 opacity-70">
                        {lastMessage ? new Date(lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <p className={cn(
                        "text-sm font-medium truncate",
                        isActive ? "text-muted-foreground" : "text-slate-500"
                      )}>
                        {lastMessage?.text ? (
                          lastMessage.text
                        ) : lastMessage?.imageUrl ? (
                          <span className="flex items-center gap-1.5 text-primary/80">
                            <ImageIcon className="h-3.5 w-3.5" />
                            {locale === "uz" ? "Rasm" : "Фото"}
                          </span>
                        ) : lastMessage?.videoUrl ? (
                          <span className="flex items-center gap-1.5 text-primary/80">
                            <Video className="h-3.5 w-3.5" />
                            {locale === "uz" ? "Video" : "Видео"}
                          </span>
                        ) : lastMessage?.audioUrl ? (
                          <span className="flex items-center gap-1.5 text-primary/80">
                            <Mic className="h-3.5 w-3.5" />
                            {locale === "uz" ? "Ovozli xabar" : "Голосовое сообщение"}
                          </span>
                        ) : (
                          t("chat.start_conv")
                        )}
                      </p>
                      {chat.unreadCount > 0 && (
                        <div className="h-5 h-5 flex items-center justify-center rounded-full bg-primary text-white text-[10px] font-black shrink-0 px-1.5">
                          {chat.unreadCount}
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-12 text-center mt-20 opacity-40">
            <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-6">
              <MessageCircle className="h-10 w-10 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground font-bold text-lg">{t("chat.no_chats")}</p>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
