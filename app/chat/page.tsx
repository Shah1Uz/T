"use client";

import { useUser } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Send, ChevronLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useLocale } from "@/context/locale-context";
import clsx from "clsx";
import MessageArea from "@/components/message-area";
import { ChatList } from "@/components/chat-list";

export default function ChatPage() {
  const { user } = useUser();
  const { t, locale } = useLocale();
  const searchParams = useSearchParams();
  const chatId = searchParams.get("id");

  const [chats, setChats] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [activeChat, setActiveChat] = useState<any>(null);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchChats() {
      if (!user) return;
      try {
        const res = await fetch("/api/chat");
        if (res.ok) {
          const data = await res.json();
          setChats(data);
        }
      } catch (error) {
        console.error("Error fetching chats:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchChats();
  }, [user]);

  useEffect(() => {
    async function fetchMessages() {
      if (!chatId || !user) return;
      try {
        const res = await fetch(`/api/chat/${chatId}/messages`);
        if (res.ok) {
          const data = await res.json();
          setMessages(data);
          const currentChat = chats.find(c => c.id === chatId);
          if (currentChat) setActiveChat(currentChat);
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    }
    fetchMessages();
  }, [chatId, user, chats]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !chatId || isSending) return;
    setIsSending(true);
    try {
      const fd = new FormData();
      fd.append("text", newMessage);

      const res = await fetch(`/api/chat/${chatId}/messages`, {
        method: "POST",
        body: fd,
      });
      if (res.ok) {
        const message = await res.json();
        setMessages([...messages, message]);
        setNewMessage("");
      }
    } finally {
      setIsSending(false);
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container px-2 md:px-4 h-[calc(100dvh-68px)] max-h-[calc(100dvh-68px)] overflow-hidden flex flex-col py-2 md:py-4">
      <div className="flex-1 flex bg-card rounded-t-[24px] md:rounded-[24px] border border-border shadow-xl overflow-hidden min-h-0">
        {/* Sidebar */}
        <div className={clsx(
          "w-full md:w-[350px] border-r border-border bg-muted/30 flex flex-col transition-all",
          chatId ? "hidden md:flex" : "flex"
        )}>
          <ChatList chats={chats} activeChatId={chatId} />
        </div>

        {/* Chat Window */}
        <div className={clsx(
          "flex-1 flex flex-col bg-card",
          !chatId ? "hidden md:flex" : "flex"
        )}>
          {chatId ? (activeChat ? (
            <MessageArea chat={{...activeChat, messages}} currentUserId={user?.id || ""} />
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-12 bg-muted/30">
              <div className="h-20 w-20 bg-blue-500/10 text-primary rounded-3xl flex items-center justify-center mb-6 shadow-inner">
                <MessageCircle className="h-10 w-10 text-primary/60" />
              </div>
              <h3 className="text-2xl font-extrabold text-foreground mb-2">{t("chat.start_conv")}</h3>
              <p className="text-muted-foreground max-w-xs font-medium">{t("chat.select_chat")}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
