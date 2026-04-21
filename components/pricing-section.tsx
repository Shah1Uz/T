"use client";

import { useLocale } from "@/context/locale-context";
import { Check, Sparkles, ShieldCheck, Zap, Info, History, CheckCircle2, Clock, ArrowRight, Users, Copy, Gift, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPaymentAction, activateFreeTrialAction, getLatestTransactionAction } from "@/server/actions/subscription.action";
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
import Link from "next/link";
 
export default function PricingSection({ currentPlan }: { currentPlan?: string }) {
  const { t, locale } = useLocale();
  const searchParams = useSearchParams();
  const { userId, isLoaded } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);
  const [expiryDate, setExpiryDate] = useState<string | null>(null);
  const [trialUsed, setTrialUsed] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [latestTransaction, setLatestTransaction] = useState<any>(null);
  const [isYearly, setIsYearly] = useState(false);

  const [referralData, setReferralData] = useState<{ code: string | null; count: number }>({ code: null, count: 0 });

  useEffect(() => {
    const status = searchParams.get("payment_status");
    if (status) {
      if (status === "0" || status === "success") {
        const fetchLatestTx = async () => {
          const res = await getLatestTransactionAction();
          if (res.success && res.transaction) {
            setLatestTransaction(res.transaction);
            setIsReportModalOpen(true);
          } else {
            toast.success(locale === "uz" ? "To'lov muvaffaqiyatli amalga oshirildi!" : "Оплата прошла успешно!");
          }
        };
        fetchLatestTx();
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
        setReferralData({
          code: data.referralCode,
          count: data.referralCount || 0
        });
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
  
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat(locale === "uz" ? "uz-UZ" : "ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

  // Discount calculation
  const discountPercent = Math.min(referralData.count * 10, 50);

  const calculatePrice = (basePrice: number) => {
    if (discountPercent === 0) return basePrice.toLocaleString();
    const discounted = Math.round(basePrice * (1 - discountPercent / 100));
    return discounted.toLocaleString();
  };

  const copyReferralLink = () => {
    if (!referralData.code) return;
    const baseUrl = window.location.origin;
    const link = `${baseUrl}?ref=${referralData.code}`;
    navigator.clipboard.writeText(link);
    toast.success(t("common.link_copied"));
  };

  const shareOnTelegram = () => {
    if (!referralData.code) return;
    const baseUrl = window.location.origin;
    const link = `${baseUrl}?ref=${referralData.code}`;
    const text = t("pricing.referral.share_msg") + link;
    window.open(`https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(text)}`, "_blank");
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
      price: calculatePrice(isYearly ? 278000 : 29000),
      originalPrice: discountPercent > 0 ? (isYearly ? "278,000" : "29,000") : null,
      icon: Zap,
      color: "text-amber-500",
      bg: "bg-amber-50",
      border: "border-slate-200",
      features: ["listings_10", "views_2x", "analytics_basic", "new_badge", "support"],
    },
    {
      id: "STANDART",
      title: t("pricing.standart_title"),
      price: calculatePrice(isYearly ? 566000 : 59000),
      originalPrice: discountPercent > 0 ? (isYearly ? "566,000" : "59,000") : null,
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
      price: calculatePrice(isYearly ? 672000 : 70000),
      originalPrice: discountPercent > 0 ? (isYearly ? "672,000" : "70,000") : null,
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
        <div className="flex flex-col items-center gap-6 mb-6">
          <div className="flex justify-center">
            <span className="bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg shadow-blue-600/20">
              UySell {locale === "uz" ? "Ta'riflari" : "Тарифы"}
            </span>
          </div>
          
          {userId && (
            <Link href={`/pricing/history${locale !== 'uz' ? `?lang=${locale}` : ''}`}>
              <Button variant="outline" className="h-10 px-5 rounded-xl font-bold border-border bg-card/50 dark:bg-slate-900/50 hover:bg-card dark:hover:bg-slate-900 transition-all shadow-sm flex items-center gap-2 group">
                <History className="h-4 w-4 text-primary group-hover:rotate-[-45deg] transition-transform" />
                {t("pricing.view_history")}
              </Button>
            </Link>
          )}
        </div>

        <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight text-foreground uppercase">
          {t("pricing.title")}
        </h2>
        <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto font-medium">
          {t("pricing.subtitle")}
        </p>

        {/* Clean Toggle */}
        <div className="mt-12 flex items-center justify-center gap-6">
          <span className={`text-xs font-black tracking-widest uppercase transition-colors ${!isYearly ? "text-blue-600" : "text-muted-foreground/60"}`}>
            {locale === "uz" ? "Oylik" : "Ежемесячно"}
          </span>
          <button
            onClick={() => setIsYearly(!isYearly)}
            className="relative w-16 h-8 rounded-full bg-muted border border-border transition-colors hover:border-accent"
          >
            <motion.div
              animate={{ x: isYearly ? 32 : 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className="absolute top-0.5 left-0.5 w-7 h-7 rounded-full bg-card border border-border shadow-sm flex items-center justify-center"
            >
              <div className={`w-1.5 h-1.5 rounded-full ${isYearly ? "bg-amber-500" : "bg-blue-600"}`} />
            </motion.div>
          </button>
          <div className="flex items-center gap-3">
            <span className={`text-xs font-black tracking-widest uppercase transition-colors ${isYearly ? "text-amber-500" : "text-muted-foreground/60"}`}>
              {locale === "uz" ? "Yillik" : "Ежегодно"}
            </span>
            <span className="bg-emerald-100 text-emerald-600 text-[9px] font-black uppercase px-2 py-1 rounded-md border border-emerald-200">
              {locale === "uz" ? "2 oy tekin" : "2 месяца бесплатно"}
            </span>
          </div>
        </div>
      </motion.div>
      
      {/* Referral Program Section */}
      {userId && referralData.code && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto mb-20 p-8 md:p-10 rounded-[40px] bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-2xl relative overflow-hidden group"
        >
          {/* Background Decorative Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-400/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4" />
          
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-[10px] font-black uppercase tracking-[0.2em] mb-6">
                <Gift className="h-4 w-4 text-amber-300" />
                {t("pricing.referral.title")}
              </div>
              <h3 className="text-3xl md:text-4xl font-black mb-4 tracking-tight leading-tight uppercase">
                {t("pricing.referral.subtitle")}
              </h3>
              
              <div className="flex flex-wrap gap-4 mt-8">
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-4 rounded-2xl flex-1 min-w-[140px]">
                  <p className="text-[10px] font-black uppercase tracking-widest text-blue-100 mb-1">{t("pricing.referral.friends_joined")}</p>
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-blue-200" />
                    <span className="text-2xl font-black">{referralData.count}</span>
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-4 rounded-2xl flex-1 min-w-[140px]">
                  <p className="text-[10px] font-black uppercase tracking-widest text-blue-100 mb-1">{t("pricing.referral.current_discount")}</p>
                  <div className="flex items-center gap-3">
                    <Sparkles className="h-5 w-5 text-amber-300" />
                    <span className="text-2xl font-black">{discountPercent}%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-6 rounded-[32px]">
                <p className="text-[11px] font-black uppercase tracking-widest text-blue-100 mb-4">{t("pricing.referral.link_title")}</p>
                <div className="relative group/link">
                  <div className="w-full h-14 bg-white/10 border border-white/20 rounded-2xl px-5 flex items-center pr-24 overflow-hidden">
                    <span className="text-sm font-bold text-blue-50 truncate opacity-80">
                      {typeof window !== 'undefined' ? `${window.location.origin}?ref=${referralData.code}` : `.../ref=${referralData.code}`}
                    </span>
                  </div>
                  <Button 
                    onClick={copyReferralLink}
                    className="absolute right-1 top-1 bottom-1 px-4 rounded-xl bg-white text-blue-800 hover:bg-blue-50 font-black text-[10px] uppercase tracking-widest transition-all active:scale-95"
                  >
                    <Copy className="h-3 w-3 mr-2" />
                    {t("pricing.referral.copy_link")}
                  </Button>
                </div>
              </div>
              
              <Button 
                onClick={shareOnTelegram}
                className="w-full h-14 rounded-2xl bg-[#0088cc] hover:bg-[#0077b5] text-white font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-blue-900/20 border border-white/10 transition-all flex items-center justify-center gap-2"
              >
                <Share2 className="h-4 w-4" />
                Telegram'da ulashish
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {plans.map((plan: any, index: number) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className={`flex flex-col relative p-8 rounded-[32px] border bg-card transition-all duration-300 ${
              plan.popular 
              ? "border-primary border-2 shadow-2xl shadow-primary/10 scale-105 z-10" 
              : "border-border shadow-sm hover:shadow-xl hover:border-accent"
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
                <div className="flex flex-col items-center">
                  {plan.originalPrice && (
                    <span className="text-[12px] font-bold text-muted-foreground/60 line-through mb-1">
                      {plan.originalPrice} {t("pricing.uzs")}
                    </span>
                  )}
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-black tracking-tighter text-foreground">{plan.price}</span>
                    <span className="text-[14px] font-bold text-muted-foreground">
                      {t("pricing.uzs")} / {isYearly ? t("pricing.year") : t("pricing.month")}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4 mb-10 px-2">
                {plan.features.map((feat: string) => (
                  <div key={feat} className="flex items-center gap-3">
                    <div className={`h-5 w-5 rounded-md flex items-center justify-center shrink-0 border ${plan.popular ? "bg-primary text-primary-foreground border-primary" : "bg-muted text-primary border-border"}`}>
                      <Check className="h-3 w-3" />
                    </div>
                    <span className="text-sm font-bold text-muted-foreground leading-tight">
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
                  <Button className="w-full h-14 rounded-2xl font-black text-sm uppercase tracking-widest bg-primary text-primary-foreground hover:opacity-90 transition-all active:scale-95">
                    {t("pricing.choose")}
                  </Button>
                </SignInButton>
              ) : currentPlan === plan.id ? (
                <div className="space-y-4">
                  <div className={`w-full h-14 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center border-2 ${
                    plan.popular ? "border-emerald-600 bg-emerald-500/10 text-emerald-600" : "border-emerald-500/20 bg-emerald-500/10 text-emerald-600"
                  }`}>
                    <ShieldCheck className="mr-2 h-5 w-5" />
                    {t("pricing.current")}
                  </div>
                  {expiryDate && (
                    <p className="text-center text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest">
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
                      ? "bg-primary text-primary-foreground hover:opacity-90 shadow-lg shadow-primary/20" 
                      : "bg-primary/10 text-primary hover:bg-primary/20"
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
                      className="w-full py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 border border-border hover:border-accent hover:text-muted-foreground transition-all flex items-center justify-center gap-2 group"
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
        <DialogContent className="sm:max-w-[450px] rounded-[48px] p-10 border-border shadow-2xl bg-card">
          <DialogHeader className="mb-8">
            <DialogTitle className="text-3xl font-black text-center tracking-tight text-foreground uppercase">
              {locale === "uz" ? "To'lov usuli" : "Способ оплаты"}
            </DialogTitle>
            <DialogDescription className="text-center font-medium text-muted-foreground text-sm mt-2">
              {selectedPlan} {locale === "uz" ? "ta'rifini faollashtirish uchun birini tanlang" : "выберите один из способов для активации тарифа"}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 gap-4">
            <Button
              variant="outline"
              className="h-20 rounded-[32px] border-border hover:border-primary hover:bg-muted group transition-all duration-500 relative overflow-hidden"
              onClick={() => initiatePayment("CLICK")}
              disabled={loading !== null}
            >
              <div className="flex items-center justify-between w-full px-6 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="shrink-0 w-10 h-10 rounded-2xl bg-[#0073FF] flex items-center justify-center transition-transform group-hover:scale-110">
                    <span className="text-white font-black italic text-xs">C</span>
                  </div>
                  <div className="text-left">
                    <span className="block text-xl font-black text-foreground tracking-tight">CLICK</span>
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest group-hover:text-foreground transition-colors">Instant Pay</span>
                  </div>
                </div>
                <div className="w-2 h-2 rounded-full bg-primary opacity-0 scale-50 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300" />
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-20 rounded-[32px] border-border hover:border-primary hover:bg-muted group transition-all duration-500 relative overflow-hidden"
              onClick={() => initiatePayment("UZUM")}
              disabled={loading !== null}
            >
              <div className="flex items-center justify-between w-full px-6 relative z-10">
                <div className="flex items-center gap-4">
                   <div className="shrink-0 w-10 h-10 rounded-2xl bg-[#6B00FF] flex items-center justify-center transition-transform group-hover:scale-110 overflow-hidden">
                    <div className="w-12 h-12 bg-white/10 rotate-45 translate-x-4 -translate-y-4" />
                  </div>
                  <div className="text-left">
                    <span className="block text-xl font-black text-foreground tracking-tight">UZUM <span className="opacity-40">Pay</span></span>
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest group-hover:text-foreground transition-colors">Digital Wallet</span>
                  </div>
                </div>
                <div className="w-2 h-2 rounded-full bg-primary opacity-0 scale-50 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300" />
              </div>
            </Button>
          </div>

          <div className="mt-8 pt-8 border-t border-border text-center">
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-4">Secure multi-payment system</p>
            <div className="flex justify-center gap-4 opacity-20 grayscale">
               <div className="h-6 w-10 bg-foreground rounded-sm" />
               <div className="h-6 w-10 bg-foreground rounded-sm" />
               <div className="h-6 w-10 bg-foreground rounded-sm" />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Payment Success Report Modal */}
      <Dialog open={isReportModalOpen} onOpenChange={setIsReportModalOpen}>
        <DialogContent className="sm:max-w-[480px] rounded-[48px] p-0 border-none bg-white dark:bg-slate-900 overflow-hidden shadow-2xl">
          <div className="relative p-10 pt-12">
            <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-emerald-500/10 to-transparent pointer-events-none" />
            
            <div className="relative z-10 text-center mb-10">
              <div className="h-20 w-20 bg-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-500/20 animate-bounce-subtle">
                <CheckCircle2 className="h-10 w-10 text-white" />
              </div>
              <DialogTitle className="text-3xl font-black tracking-tight text-foreground uppercase mb-2">
                {t("pricing.payment_report")}
              </DialogTitle>
              <DialogDescription className="text-emerald-600 font-bold uppercase tracking-widest text-xs">
                {t("pricing.success_message")}
              </DialogDescription>
            </div>

            {latestTransaction && (
              <div className="space-y-6">
                <div className="bg-muted p-6 rounded-[32px] border border-border">
                   <div className="grid grid-cols-2 gap-y-6">
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t("pricing.active_plan")}</p>
                        <div className="flex items-center gap-2">
                           {latestTransaction.plan === 'VIP' ? <Sparkles className="h-4 w-4 text-purple-600" /> : latestTransaction.plan === 'STANDART' ? <ShieldCheck className="h-4 w-4 text-blue-600" /> : <Zap className="h-4 w-4 text-amber-500" />}
                           <span className="font-black text-foreground uppercase">{latestTransaction.plan}</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t("pricing.payment_amount")}</p>
                        <p className="font-black text-foreground">{latestTransaction.amount.toLocaleString()} <span className="text-xs">{t("pricing.uzs")}</span></p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t("pricing.payment_time")}</p>
                        <div className="flex items-center gap-2 text-foreground font-bold text-sm">
                           <Clock className="h-4 w-4 text-slate-400" />
                           {formatDate(latestTransaction.createdAt)}
                        </div>
                      </div>
                      <div>
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t("pricing.status")}</p>
                         <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                           Success
                         </span>
                      </div>
                   </div>

                   <div className="mt-6 pt-6 border-t border-border/50">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{t("pricing.transaction_id")}</p>
                      <p className="font-mono text-[11px] text-muted-foreground bg-card px-4 py-3 rounded-xl border border-border select-all">
                        {latestTransaction.providerTransId || latestTransaction.id}
                      </p>
                   </div>
                </div>

                <div className="flex gap-3">
                  <Button 
                    className="flex-1 h-14 rounded-2xl font-black uppercase text-xs tracking-widest bg-primary text-primary-foreground hover:opacity-90"
                    onClick={() => setIsReportModalOpen(false)}
                  >
                    OK
                  </Button>
                  <Link href={`/pricing/history${locale !== 'uz' ? `?lang=${locale}` : ''}`} className="flex-1">
                    <Button variant="outline" className="w-full h-14 rounded-2xl font-black uppercase text-xs tracking-widest border-border hover:bg-muted flex items-center gap-2">
                       {t("pricing.history").split(' ')[0]}
                       <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
