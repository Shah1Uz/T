import { bannerService } from "@/server/services/banner.service";
import Link from "next/link";
import { Plus, Pencil, Trash, CheckCircle2, XCircle } from "lucide-react";
import Image from "next/image";
import BannerActions from "./banner-actions";

export default async function AdminBannersPage() {
  const banners = await bannerService.getAll();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between w-full h-auto py-4 px-6 bg-white dark:bg-gray-900 shadow-sm border border-border sm:items-center gap-4 rounded-xl">
        <h2 className="text-xl font-bold flex items-center gap-2">
          Reklama Bannerlari
          <span className="bg-primary/10 text-primary text-xs font-black px-2 py-0.5 rounded-full">
            {banners.length}
          </span>
        </h2>
        
        <Link 
          href="/admin/banners/new"
          className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center justify-center gap-2 px-6 h-12 rounded-xl font-bold shadow-md transition-all uppercase tracking-wider text-sm"
        >
          <Plus className="w-5 h-5" />
          Yangi Banner
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted text-muted-foreground uppercase text-xs font-bold font-mono">
              <tr>
                <th className="px-6 py-4 rounded-tl-xl w-32">Rasm</th>
                <th className="px-6 py-4">Havola (Link)</th>
                <th className="px-6 py-4 text-center">Tartib</th>
                <th className="px-6 py-4 text-center">Faol</th>
                <th className="px-6 py-4 text-right rounded-tr-xl">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {banners.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground font-medium">
                    Hozircha reklama bannerlari yo'q. Yangi banner qo'shing.
                  </td>
                </tr>
              ) : (
                banners.map((banner) => (
                  <tr key={banner.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="relative w-24 h-12 bg-muted rounded-md overflow-hidden">
                        <Image
                          src={banner.imageUrl}
                          alt="Banner"
                          fill
                          className="object-cover"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium max-w-[200px] truncate text-primary/80">
                      {banner.link ? (
                        <a href={banner.link} target="_blank" rel="noreferrer" className="hover:underline">
                          {banner.link}
                        </a>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center font-bold">
                      {banner.order}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center">
                        {banner.isActive ? (
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-500" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <BannerActions banner={banner} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
