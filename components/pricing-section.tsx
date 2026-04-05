"use client";

import { useLocale } from "@/context/locale-context";
import { Check, Sparkles, ShieldCheck, Zap, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPaymentAction, activateFreeTrialAction } from "@/server/actions/subscription.action";
import { toast } from "sonner";
import { useAuth, SignInButton } from "@clerk/nextjs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
 
export default function PricingSection({ currentPlan }: { currentPlan?: string }) {
  const { t, locale } = useLocale();
  const searchParams = useSearchParams();
  const { userId, isLoaded } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);
  const [expiryDate, setExpiryDate] = useState<string | null>(null);
  const [trialUsed, setTrialUsed] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isYearly, setIsYearly] = useState(false);

  useEffect(() => {
    const status = searchParams.get("payment_status");
    if (status) {
      if (status === "0" || status === "success") {
        toast.success(locale === "uz" ? "To'lov muvaffaqiyatli amalga oshirildi!" : "Оплата прошла успешно!");
      } else if (status === "-21") {
        toast.error(locale === "uz" ? "Hisobingizda mablag' yetarli emas." : "Недостаточно средств на счету.");
      } else if (status === "-1" || status === "error") {
        toast.error(locale === "uz" ? "To'lov jarayonida xatolik yuz berdi." : "Произошла ошибка при оплате.");
      }
    }
  }, [searchParams, locale]);

  useEffect(() => {
    const checkPlan = async () => {
      try {
        const res = await fetch("/api/user/plan");
        if (!res.ok) return;
        const text = await res.text();
        if (!text) return;
        const data = JSON.parse(text);
        if (data.planExpiresAt) {
          setExpiryDate(new Date(data.planExpiresAt).toLocaleDateString("zh-CN"));
        }
        if (data.trialUsed !== undefined) {
          setTrialUsed(data.trialUsed);
        }
      } catch (e) {
        console.error("Failed to fetch plan expiry", e);
      }
    };
    if (userId) checkPlan();
  }, [userId]);

  const handleActivateTrial = async (plan: string) => {
    setLoading(plan);
    try {
      const res = await activateFreeTrialAction(plan);
      if (res.success) {
        toast.success(locale === "uz" ? "Bepul trial muvaffaqiyatli faollashtirildi! (3 kun)" : "Бесплатный триал активирован! (3 дня)");
        window.location.reload();
      } else {
        toast.error(res.error || "Xatolik yuz berdi");
      }
    } catch (e) {
      toast.error("Network error");
    } finally {
      setLoading(null);
    }
  };

  const handleSelectPlan = (plan: string) => {
    if (plan === "FREE") return;
    setSelectedPlan(plan);
    setIsPaymentModalOpen(true);
  };

  const initiatePayment = async (provider: "CLICK" | "UZUM") => {
    if (!selectedPlan) return;
    setLoading(provider);
    try {
      const res = await createPaymentAction(selectedPlan, provider);
      if (res.success && res.paymentUrl) {
        window.location.href = res.paymentUrl;
      } else {
        toast.error(res.error || "Xatolik yuz berdi");
      }
    } catch (e) {
      toast.error("Network error");
    } finally {
      setLoading(null);
      setIsPaymentModalOpen(false);
    }
  };
 
  const plans = [
    {
      id: "FREE",
      title: t("pricing.free_title"),
      price: "0",
      icon: Check,
      color: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-slate-200",
      features: ["listings_3", "views_standard"],
    },
    {
      id: "EKONOM",
      title: t("pricing.ekonom_title"),
      price: isYearly ? "278,000" : "29,000",
      icon: Zap,
      color: "text-amber-500",
      bg: "bg-amber-50",
      border: "border-slate-200",
      features: ["listings_10", "views_2x", "analytics_basic", "new_badge", "support"],
    },
    {
      id: "STANDART",
      title: t("pricing.standart_title"),
      price: isYearly ? "566,000" : "59,000",
      icon: ShieldCheck,
      color: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-600",
      features: ["listings_30", "views_5x", "priority", "analytics_full", "highlight", "stories_daily", "support"],
      popular: true,
    },
    {
      id: "VIP",
      title: t("pricing.vip_title"),
      price: isYearly ? "672,000" : "70,000",
      icon: Sparkles,
      color: "text-purple-600",
      bg: "bg-purple-50",
      border: "border-slate-200",
      features: ["vip_ads_3", "listings_unlimited", "priority_max", "verified", "social_media", "video_ads", "support"],
    },
  ];

  return (
    <section className="py-20 md:py-32 container px-4 sm:px-6">
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16"
      >
        <div className="flex justify-center mb-6">
           <span className="bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg shadow-blue-600/20">
             UySell {locale === "uz" ? "Ta'riflari" : "Тарифы"}
           </span>
        </div>
        <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight text-slate-900 uppercase">
          {t("pricing.title")}
        </h2>
        <p className="text-slate-500 text-base md:text-lg max-w-2xl mx-auto font-medium">
          {t("pricing.subtitle")}
        </p>

        {/* Clean Toggle */}
        <div className="mt-12 flex items-center justify-center gap-6">
          <span className={`text-xs font-black tracking-widest uppercase transition-colors ${!isYearly ? "text-blue-600" : "text-slate-400"}`}>
            {locale === "uz" ? "Oylik" : "Ежемесячно"}
          </span>
          <button
            onClick={() => setIsYearly(!isYearly)}
            className="relative w-16 h-8 rounded-full bg-slate-100 border border-slate-200 transition-colors hover:border-slate-300"
          >
            <motion.div
              animate={{ x: isYearly ? 32 : 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className="absolute top-0.5 left-0.5 w-7 h-7 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center"
            >
              <div className={`w-1.5 h-1.5 rounded-full ${isYearly ? "bg-amber-500" : "bg-blue-600"}`} />
            </motion.div>
          </button>
          <div className="flex items-center gap-3">
            <span className={`text-xs font-black tracking-widest uppercase transition-colors ${isYearly ? "text-amber-500" : "text-slate-400"}`}>
              {locale === "uz" ? "Yillik" : "Ежегодно"}
            </span>
            <span className="bg-emerald-100 text-emerald-600 text-[9px] font-black uppercase px-2 py-1 rounded-md border border-emerald-200">
              {locale === "uz" ? "2 oy tekin" : "2 месяца бесплатно"}
            </span>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {plans.map((plan: any, index: number) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className={`flex flex-col relative p-8 rounded-[32px] border bg-white transition-all duration-300 ${
              plan.popular 
              ? "border-blue-600 border-2 shadow-2xl shadow-blue-600/10 scale-105 z-10" 
              : "border-slate-200 shadow-sm hover:shadow-xl hover:border-slate-300"
            }`}
          >
            {plan.popular && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <span className="bg-blue-600 text-white text-[11px] font-black uppercase tracking-widest px-6 py-2 rounded-full whitespace-nowrap shadow-xl">
                  {locale === "uz" ? "Tavsiya qilamiz" : "Рекомендуем"}
                </span>
              </div>
            )}

            <div className="flex-1">
              <div className="mb-10 text-center">
                <div className={`h-16 w-16 mx-auto rounded-3xl flex items-center justify-center mb-6 border ${plan.bg} ${plan.border} shadow-sm`}>
                  <plan.icon className={`h-8 w-8 ${plan.color}`} />
                </div>
                <h3 className="text-xl font-black mb-2 tracking-tight uppercase">{plan.title}</h3>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-black tracking-tighter text-slate-900">{plan.price}</span>
                  <span className="text-[14px] font-bold text-slate-500">
                    {t("pricing.uzs")} / {isYearly ? t("pricing.year") : t("pricing.month")}
                  </span>
                </div>
              </div>

              <div className="space-y-4 mb-10 px-2">
                {plan.features.map((feat: string) => (
                  <div key={feat} className="flex items-center gap-3">
                    <div className={`h-5 w-5 rounded-md flex items-center justify-center shrink-0 border ${plan.popular ? "bg-blue-600 text-white border-blue-600" : "bg-slate-50 text-blue-600 border-slate-100"}`}>
                      <Check className="h-3 w-3" />
                    </div>
                    <span className="text-sm font-bold text-slate-600 leading-tight">
                      {t(`pricing.features.${feat}`)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-auto">
              {!isLoaded ? (
                <div className="w-full h-14 rounded-2xl bg-slate-100 animate-pulse" />
              ) : !userId ? (
                <SignInButton mode="modal">
                  <Button className="w-full h-14 rounded-2xl font-black text-sm uppercase tracking-widest bg-slate-900 text-white hover:bg-black transition-all active:scale-95">
                    {t("pricing.choose")}
                  </Button>
                </SignInButton>
              ) : currentPlan === plan.id ? (
                <div className="space-y-4">
                  <div className={`w-full h-14 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center border-2 ${
                    plan.popular ? "border-emerald-600 bg-emerald-50 text-emerald-600" : "border-emerald-100 bg-emerald-50 text-emerald-600"
                  }`}>
                    <ShieldCheck className="mr-2 h-5 w-5" />
                    {t("pricing.current")}
                  </div>
                  {expiryDate && (
                    <p className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                       {locale === "uz" ? "Tugaydi:" : "До:"} {expiryDate}
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                   <Button
                    onClick={() => handleSelectPlan(plan.id)}
                    disabled={loading !== null || plan.id === "FREE"}
                    className={`w-full h-14 rounded-2xl font-black text-sm uppercase tracking-widest transition-all duration-300 active:scale-95 ${
                      plan.popular 
                      ? "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/20" 
                      : "bg-slate-900 text-white hover:bg-black"
                    }`}
                  >
                    {loading === plan.id ? (
                      <div className="h-5 w-5 border-2 border-white/30 border-t-white animate-spin rounded-full" />
                    ) : (
                      t("pricing.choose")
                    )}
                  </Button>

                  {plan.id !== "FREE" && !trialUsed && (
                    <button
                      onClick={() => handleActivateTrial(plan.id)}
                      disabled={loading !== null}
                      className="w-full py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 border border-slate-100 hover:border-slate-300 hover:text-slate-600 transition-all flex items-center justify-center gap-2 group"
                    >
                       <Zap className="h-3 w-3 transition-transform group-hover:scale-110 text-amber-500 fill-current" />
                       {locale === "uz" ? "Bepul sinash (3 kun)" : "Пробовать бесплатно (3 дня)"}
                    </button>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
        <DialogContent className="sm:max-w-[450px] rounded-[48px] p-10 border-neutral-100 shadow-2xl">
          <DialogHeader className="mb-8">
            <DialogTitle className="text-3xl font-black text-center tracking-tight text-neutral-900">
              {locale === "uz" ? "To'lov usuli" : "Способ оплаты"}
            </DialogTitle>
            <DialogDescription className="text-center font-medium text-neutral-500 text-sm mt-2">
              {selectedPlan} {locale === "uz" ? "ta'rifini faollashtirish uchun birini tanlang" : "выберите один из способов для активации тарифа"}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 gap-4">
            <Button
              variant="outline"
              className="h-20 rounded-[32px] border-neutral-100 hover:border-neutral-900 hover:bg-neutral-50 group transition-all duration-500 relative overflow-hidden"
              onClick={() => initiatePayment("CLICK")}
              disabled={loading !== null}
            >
              <div className="flex items-center justify-between w-full px-6 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="shrink-0 w-10 h-10 rounded-2xl bg-[#0073FF] flex items-center justify-center transition-transform group-hover:scale-110">
                    <span className="text-white font-black italic text-xs">C</span>
                  </div>
                  <div className="text-left">
                    <span className="block text-xl font-black text-neutral-900 tracking-tight">CLICK</span>
                    <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-widest group-hover:text-neutral-600 transition-colors">Instant Pay</span>
                  </div>
                </div>
                <div className="w-2 h-2 rounded-full bg-neutral-900 opacity-0 scale-50 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300" />
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-20 rounded-[32px] border-neutral-100 hover:border-neutral-900 hover:bg-neutral-50 group transition-all duration-500 relative overflow-hidden"
              onClick={() => initiatePayment("UZUM")}
              disabled={loading !== null}
            >
              <div className="flex items-center justify-between w-full px-6 relative z-10">
                <div className="flex items-center gap-4">
                   <div className="shrink-0 w-10 h-10 rounded-2xl bg-[#6B00FF] flex items-center justify-center transition-transform group-hover:scale-110 overflow-hidden">
                    <div className="w-12 h-12 bg-neutral-900/10 rotate-45 translate-x-4 -translate-y-4" />
                  </div>
                  <div className="text-left">
                    <span className="block text-xl font-black text-neutral-900 tracking-tight">UZUM <span className="opacity-40">Pay</span></span>
                    <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-widest group-hover:text-neutral-600 transition-colors">Digital Wallet</span>
                  </div>
                </div>
                <div className="w-2 h-2 rounded-full bg-neutral-900 opacity-0 scale-50 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300" />
              </div>
            </Button>
          </div>

          <div className="mt-8 pt-8 border-t border-neutral-50 text-center">
            <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-[0.2em] mb-4">Secure multi-payment system</p>
            <div className="flex justify-center gap-4 opacity-20 grayscale">
               <div className="h-6 w-10 bg-neutral-900 rounded-sm" />
               <div className="h-6 w-10 bg-neutral-900 rounded-sm" />
               <div className="h-6 w-10 bg-neutral-900 rounded-sm" />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
