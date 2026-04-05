"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { MessageSquare, Loader2 } from "lucide-react";
import { useUser, SignInButton } from "@clerk/nextjs";
import { useLocale } from "@/context/locale-context";

export default function StartChatButton({ listingId, sellerId }: { listingId: string; sellerId: string }) {
  const { user, isLoaded } = useUser();
  const { t } = useLocale();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleStartChat = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const res = await fetch("/api/chat/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId }),
      });
      
      if (res.ok) {
        const chat = await res.json();
        router.push(`/chat?id=${chat.id}`);
      }
    } catch (error) {
      console.error("Error starting chat:", error);
    } finally {
      setIsLoading(true); // Keep loading state until redirect
    }
  };

  if (!isLoaded) {
    return <div className="w-full h-14 bg-muted animate-pulse rounded-[16px]" />;
  }

  if (!user) {
    return (
      <SignInButton mode="modal">
        <Button variant="outline" className="w-full h-14 text-[16px] font-bold rounded-[16px] border-gray-200 hover:bg-gray-50 text-gray-700 hover:text-gray-900 transition-all hover:shadow-sm" size="lg">
          <MessageSquare className="h-[18px] w-[18px] mr-2 text-gray-400" />
          {t("chat.login_to_start")}
        </Button>
      </SignInButton>
    );
  }

  if (user.id === sellerId) return null;

  return (
    <Button 
      variant="outline" 
      className="w-full h-14 text-[16px] font-bold rounded-[16px] border-gray-200 hover:bg-gray-50 text-gray-700 hover:text-gray-900 transition-all hover:shadow-sm" 
      size="lg"
      onClick={handleStartChat}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="h-[18px] w-[18px] animate-spin text-primary" />
      ) : (
        <>
          <MessageSquare className="h-[18px] w-[18px] mr-2 text-gray-400" />
          {t("chat.contact_seller")} ✉️
        </>
      )}
    </Button>
  );
}
