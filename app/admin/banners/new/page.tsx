"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import BannerForm from "../_components/banner-form";

export default function NewBannerPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/banners" className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-2xl font-bold">Yangi Reklama Banneri</h1>
      </div>

      <BannerForm />
    </div>
  );
}
