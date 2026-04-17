"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { PusherClient } from "@/lib/pusher-client";
import { toast } from "sonner";
import { useSearchParams, usePathname } from "next/navigation";
import { useRouter } from "next/navigation";

export default function PusherListener() {
  const { user } = useUser();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const currentChatId = searchParams.get("id");

  useEffect(() => {
    if (!user || !PusherClient) return;

    const channel = PusherClient.subscribe(`user-${user.id}`);

    channel.bind("chat-update", (data: any) => {
      console.log("Global Chat Update Received:", data);

      // Dispatch a custom event so other components (like ChatList) can update
      window.dispatchEvent(new CustomEvent("chat-updated", { detail: data }));

      // Handle notifications
      if (data.type === "new-message") {
        const message = data.message;
        
        // Don't show toast if we sent the message
        if (message.senderId === user.id) return;

        // Don't show toast if we are already in this chat window
        const isCurrentlyInThisChat = pathname.startsWith("/chat") && currentChatId === data.chatId;
        if (isCurrentlyInThisChat) return;

        // Show toast notification
        toast.info(message.sender?.name || "Yangi xabar", {
          description: message.text || "Rasm yoki ovozli xabar",
          action: {
            label: "Ochish",
            onClick: () => router.push(`/chat?id=${data.chatId}`),
          },
        });
      }
    });

    return () => {
      PusherClient.unsubscribe(`user-${user.id}`);
    };
  }, [user, currentChatId, pathname, router]);

  return null;
}
