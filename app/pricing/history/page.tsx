import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { CreditCard, Calendar, Clock, CheckCircle2, ArrowLeft, ShieldCheck, Zap, Sparkles } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

async function getTranslations(locale: string) {
  const { translations } = await import("@/lib/translations");
  return translations[locale] || translations.uz;
}

export default async function PaymentHistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const resolvedParams = await searchParams;
  const lang = resolvedParams.lang || "uz";
  const t = await getTranslations(lang);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      transactions: {
        where: { status: "COMPLETED" },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!user) redirect("/");

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat(lang === "uz" ? "uz-UZ" : "ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat(lang === "uz" ? "uz-UZ" : "ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const getPlanIcon = (plan: string) => {
    switch (plan) {
      case "VIP": return <Sparkles className="h-5 w-5 text-purple-600" />;
      case "STANDART": return <ShieldCheck className="h-5 w-5 text-blue-600" />;
      case "EKONOM": return <Zap className="h-5 w-5 text-amber-500" />;
      default: return <CreditCard className="h-5 w-5 text-slate-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-32 pb-20">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Link href="/pricing" className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors mb-4 font-bold">
              <ArrowLeft className="h-4 w-4" />
              {t.common.back}
            </Link>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
              {t.pricing.history}
            </h1>
          </div>
          <div className="hidden md:block">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t.pricing.active_plan}</p>
                <div className="flex items-center gap-2">
                    {getPlanIcon(user.plan)}
                    <span className="font-black text-slate-900 dark:text-white">{user.plan}</span>
                </div>
                {user.planExpiresAt && (
                    <p className="text-[10px] font-bold text-slate-500 mt-1">
                        {t.pricing.expires_at}: {formatDate(user.planExpiresAt)}
                    </p>
                )}
            </div>
          </div>
        </div>

        <div className="md:hidden mb-8 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t.pricing.active_plan}</p>
            <div className="flex items-center gap-2 mb-2">
                {getPlanIcon(user.plan)}
                <span className="font-black text-xl text-slate-900 dark:text-white">{user.plan}</span>
            </div>
            {user.planExpiresAt && (
                <p className="text-xs font-bold text-slate-500">
                    {t.pricing.expires_at}: {formatDate(user.planExpiresAt)}
                </p>
            )}
        </div>

        <div className="space-y-4">
          {user.transactions.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-[32px] border border-dashed border-slate-200 dark:border-slate-800">
              <div className="h-16 w-16 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CreditCard className="h-8 w-8 text-slate-300" />
              </div>
              <p className="text-slate-500 font-bold">{t.ikkilamchi.no_listings}</p>
            </div>
          ) : (
            user.transactions.map((tx) => (
              <div 
                key={tx.id}
                className="bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className={`h-12 w-12 rounded-2xl flex items-center justify-center border ${
                        tx.plan === 'VIP' ? 'bg-purple-50 border-purple-100 text-purple-600' :
                        tx.plan === 'STANDART' ? 'bg-blue-50 border-blue-100 text-blue-600' :
                        'bg-amber-50 border-amber-100 text-amber-500'
                    }`}>
                      {getPlanIcon(tx.plan)}
                    </div>
                    <div>
                      <h3 className="font-black text-lg text-slate-900 dark:text-white uppercase leading-tight">
                        {tx.plan} {t.pricing.history.toLowerCase().includes('tarixi') ? "Ta'rifi" : "Тариф"}
                      </h3>
                      <div className="flex items-center gap-3 mt-1 text-slate-500 font-bold text-xs">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(tx.createdAt)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatTime(tx.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:text-right gap-8 border-t md:border-t-0 pt-4 md:pt-0 border-slate-100 dark:border-slate-800">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t.pricing.payment_amount}</p>
                      <p className="font-black text-lg text-slate-900 dark:text-white">
                        {tx.amount.toLocaleString()} <span className="text-xs">{t.pricing.uzs}</span>
                      </p>
                    </div>
                    <div className="hidden sm:block">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t.pricing.transaction_id}</p>
                      <p className="font-mono text-xs text-slate-500 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-700">
                        {tx.providerTransId || tx.id}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-xl border border-emerald-100 dark:border-emerald-800">
                      <CheckCircle2 className="h-4 w-4" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Success</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
