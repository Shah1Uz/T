"use client";
 
import { useLocale } from "@/context/locale-context";
import { Shield, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
 
export default function PrivacyPage() {
  const { t } = useLocale();
 
  return (
    <div className="bg-background text-foreground min-h-screen py-20 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-12 flex items-center justify-between">
          <Button variant="ghost" className="rounded-xl" asChild>
            <Link href="/" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              {t("common.back")}
            </Link>
          </Button>
          <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
            <Shield className="h-6 w-6" />
          </div>
        </div>
 
        <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">
          {t("privacy.title")}
        </h1>
        <p className="text-muted-foreground font-medium mb-12">
          {t("privacy.last_updated")}
        </p>
 
        <div className="prose prose-slate dark:prose-invert max-w-none space-y-12">
          <section>
            <p className="text-xl leading-relaxed text-muted-foreground font-medium">
              {t("privacy.intro")}
            </p>
          </section>
 
          <section className="space-y-4">
            <h2 className="text-2xl font-black tracking-tight">
              {t("privacy.section_1_title")}
            </h2>
            <p className="text-lg leading-relaxed text-muted-foreground">
              {t("privacy.section_1_content")}
            </p>
          </section>
 
          <section className="space-y-4">
            <h2 className="text-2xl font-black tracking-tight">
              {t("privacy.section_2_title")}
            </h2>
            <p className="text-lg leading-relaxed text-muted-foreground">
              {t("privacy.section_2_content")}
            </p>
          </section>
 
          <section className="space-y-4">
            <h2 className="text-2xl font-black tracking-tight">
              {t("privacy.section_3_title")}
            </h2>
            <p className="text-lg leading-relaxed text-muted-foreground">
              {t("privacy.section_3_content")}
            </p>
          </section>
        </div>
 
        <div className="mt-20 p-8 rounded-[32px] bg-muted/30 border border-border/50 text-center">
          <p className="text-muted-foreground font-medium mb-6">
            © 2026 UY SELL LUXURY REAL ESTATE PORTAL. ALL RIGHTS RESERVED.
          </p>
          <Button className="rounded-2xl font-bold px-8" asChild>
            <Link href="/">{t("common.home_back")}</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
