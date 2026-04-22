"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MessageSquare, ExternalLink, Loader2, Clock } from "lucide-react";
import Link from "next/link";

export default function AdminSupportPage() {
  const [chats, setChats] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchSupportChats() {
      try {
        const res = await fetch("/api/admin/support");
        if (res.ok) {
          const data = await res.json();
          setChats(data);
        }
      } catch (error) {
        console.error("Error fetching support chats:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchSupportChats();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Support Chats</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Manage user support requests and inquiries.</p>
        </div>
        <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
          <MessageSquare className="h-6 w-6" />
        </div>
      </div>

      {chats.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800">
          <div className="h-20 w-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <MessageSquare className="h-10 w-10 text-slate-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No active support chats</h3>
          <p className="text-slate-500 max-w-xs mx-auto">When users contact support, they will appear here.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {chats.map((chat) => {
            // Find the non-admin participant (the user)
            const userParticipant = chat.participants.find((p: any) => p.user?.role !== "ADMIN");
            const user = userParticipant?.user;
            const lastMessage = chat.messages?.[0];

            return (
              <div 
                key={chat.id} 
                className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 flex items-center justify-between hover:shadow-lg transition-all group"
              >
                <div className="flex items-center gap-4">
                  <Avatar className="h-14 w-14 border-2 border-slate-100 dark:border-slate-800 group-hover:scale-105 transition-transform">
                    <AvatarImage src={user?.imageUrl} />
                    <AvatarFallback className="bg-primary/5 text-primary font-black">
                      {user?.name?.substring(0, 2).toUpperCase() || "US"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                      {user?.name || "Anonymous User"}
                    </h3>
                    <div className="flex items-center gap-3 mt-1">
                      <p className="text-sm text-slate-500 line-clamp-1 italic max-w-md">
                        {lastMessage?.text || "No messages yet"}
                      </p>
                      <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full text-slate-500 font-bold flex items-center gap-1 uppercase tracking-tighter">
                        <Clock className="h-3 w-3" />
                        {new Date(chat.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <Button asChild variant="outline" className="rounded-2xl border-slate-200 dark:border-slate-800 hover:bg-primary/5 hover:text-primary hover:border-primary/20 transition-all">
                  <Link href={`/chat?id=${chat.id}`} target="_blank" className="flex items-center gap-2">
                    <span className="font-bold">Open Chat</span>
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
