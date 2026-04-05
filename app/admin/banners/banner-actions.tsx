"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Edit, Trash, Power } from "lucide-react";
import { toggleBannerActiveAction, deleteBannerAction } from "@/server/actions/banner.action";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function BannerActions({ banner }: { banner: any }) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleToggle = async () => {
    setIsLoading(true);
    await toggleBannerActiveAction(banner.id, !banner.isActive);
    setIsLoading(false);
    router.refresh();
  };

  const handleDelete = async () => {
    if (!confirm("Bannerni o'chirishga ishonchingiz komilmi?")) return;
    setIsLoading(true);
    await deleteBannerAction(banner.id);
    setIsLoading(false);
    router.refresh();
  };

  return (
    <div className="flex items-center justify-end gap-2">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleToggle}
        disabled={isLoading}
        className={banner.isActive ? "text-orange-500 hover:text-orange-600" : "text-green-500 hover:text-green-600"}
      >
        <Power className="w-4 h-4 mr-1" />
        {banner.isActive ? "O'chirish" : "Yoqish"}
      </Button>
      <Button 
        variant="outline" 
        size="sm" 
        asChild
        className="text-primary hover:text-primary-foreground hover:bg-primary"
      >
        <Link href={`/admin/banners/${banner.id}/edit`}>
          <Edit className="w-4 h-4" />
        </Link>
      </Button>
      <Button 
        variant="destructive" 
        size="sm" 
        onClick={handleDelete}
        disabled={isLoading}
      >
        <Trash className="w-4 h-4" />
      </Button>
    </div>
  );
}
