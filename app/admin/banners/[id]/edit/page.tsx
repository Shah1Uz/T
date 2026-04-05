import { bannerService } from "@/server/services/banner.service";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import BannerForm from "../../_components/banner-form";

export default async function EditBannerPage({ params }: { params: { id: string } }) {
  const { id } = params;
  
  // Fetch banner data (Server Component)
  const banners = await bannerService.getAll();
  const banner = banners.find(b => b.id === id);

  if (!banner) {
    notFound();
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/banners" className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-2xl font-bold">Bannerni Tahrirlash</h1>
      </div>

      <BannerForm initialData={banner} isEdit={true} />
    </div>
  );
}
