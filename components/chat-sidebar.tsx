"use client";

import { ChatList } from "./chat-list";
import { Badge } from "@/components/ui/badge";

export default function ChatSidebar({ chats, currentUserId, activeChatId }: { chats: any[], currentUserId: string, activeChatId?: string }) {
  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b bg-card/50 backdrop-blur-sm flex items-center justify-between">
        <h2 className="text-2xl font-extrabold tracking-tighter text-foreground">Xabarlar</h2>
        <Badge variant="secondary" className="h-5 px-2 font-bold text-[10px] rounded-full uppercase tracking-wider opacity-70">Beta</Badge>
      </div>
      <ChatList chats={chats} />
    </div>
  );
}
