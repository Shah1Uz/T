"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createNewsAction } from "@/server/actions/news.action";
import { toast } from "sonner";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewNewsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    titleUz: "",
    titleRu: "",
    excerptUz: "",
    excerptRu: "",
    contentUz: "",
    contentRu: "",
    imageUrl: "",
    categoryUz: "",
    categoryRu: "",
  });

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const res = await createNewsAction(formData);
    if (res.success) {
      toast.success("Yangilik muvaffaqiyatli qo'shildi!");
      router.push("/admin?activeTab=news");
      router.refresh();
    } else {
      toast.error(res.error || "Xatolik yuz berdi");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="flex items-center gap-4 mb-8">
        <Button asChild variant="outline" size="icon" className="rounded-xl">
          <Link href="/admin"><ArrowLeft className="h-5 w-5" /></Link>
        </Button>
        <h1 className="text-3xl font-black">Yangi yangilik qo'shish</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-slate-900 p-8 rounded-[32px] border border-border/50 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Rasm URL</label>
            <Input name="imageUrl" required value={formData.imageUrl} onChange={handleChange} className="h-12 rounded-xl" placeholder="https://..." />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Kategoriya (UZ)</label>
            <Input name="categoryUz" required value={formData.categoryUz} onChange={handleChange} className="h-12 rounded-xl" placeholder="Masalan: Bozor tahlili" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Kategoriya (RU)</label>
            <Input name="categoryRu" required value={formData.categoryRu} onChange={handleChange} className="h-12 rounded-xl" placeholder="Например: Анализ рынка" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="font-bold text-lg border-b pb-2">O'zbek tilida</h3>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase">Sarlavha</label>
              <Input name="titleUz" required value={formData.titleUz} onChange={handleChange} className="h-12 rounded-xl" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase">Qisqacha</label>
              <Textarea name="excerptUz" required value={formData.excerptUz} onChange={handleChange} className="rounded-xl resize-none h-24" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase">To'liq matn (ixtiyoriy)</label>
              <Textarea name="contentUz" value={formData.contentUz} onChange={handleChange} className="rounded-xl min-h-[150px]" />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-lg border-b pb-2">Rus tilida</h3>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase">Sarlavha</label>
              <Input name="titleRu" required value={formData.titleRu} onChange={handleChange} className="h-12 rounded-xl" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase">Qisqacha</label>
              <Textarea name="excerptRu" required value={formData.excerptRu} onChange={handleChange} className="rounded-xl resize-none h-24" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase">To'liq matn (ixtiyoriy)</label>
              <Textarea name="contentRu" value={formData.contentRu} onChange={handleChange} className="rounded-xl min-h-[150px]" />
            </div>
          </div>
        </div>

        <Button disabled={loading} type="submit" className="w-full h-14 rounded-2xl text-lg font-bold shadow-xl">
          {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Saqlash va Nashr qilish"}
        </Button>
      </form>
    </div>
  );
}
