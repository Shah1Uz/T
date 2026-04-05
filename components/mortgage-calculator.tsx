"use client";

import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useLocale } from "@/context/locale-context";
import { Calculator } from "lucide-react";

interface MortgageCalculatorProps {
  price: number;
}

export default function MortgageCalculator({ price }: MortgageCalculatorProps) {
  const { t } = useLocale();
  
  const [downPaymentPercent, setDownPaymentPercent] = useState(20);
  const [interestRate, setInterestRate] = useState(18);
  const [years, setYears] = useState(15);
  const [monthlyPayment, setMonthlyPayment] = useState(0);

  useEffect(() => {
    // Principal loan amount
    const principal = price - (price * (downPaymentPercent / 100));
    const monthlyRate = (interestRate / 100) / 12;
    const numPayments = years * 12;

    if (monthlyRate === 0) {
      setMonthlyPayment(principal / numPayments);
    } else {
      const payment = principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
      setMonthlyPayment(payment > 0 ? payment : 0);
    }
  }, [price, downPaymentPercent, interestRate, years]);

  return (
    <div className="bg-card border border-border rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
      <div className="flex items-center gap-3 mb-2">
        <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center">
          <Calculator className="h-5 w-5 text-primary" />
        </div>
        <h3 className="text-xl font-bold text-foreground">{t("listing.mortgage_calc")}</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        <div className="space-y-3">
          <Label className="text-sm font-semibold flex justify-between">
            <span className="text-muted-foreground">{t("listing.down_payment")}</span>
            <span className="text-foreground font-bold">{downPaymentPercent}%</span>
          </Label>
          <Input 
            type="range" 
            min="0" max="100" step="5"
            value={downPaymentPercent}
            onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
            className="w-full accent-primary h-2"
          />
          <div className="text-xs text-muted-foreground font-bold bg-muted/50 p-2 rounded-lg text-center mt-2 border border-border/50">
            ~ {((price * downPaymentPercent) / 100).toLocaleString("en-US")} USD
          </div>
        </div>

        <div className="space-y-3">
          <Label className="text-sm font-semibold flex justify-between items-center">
            <span className="text-muted-foreground">{t("listing.interest_rate")}</span>
            <div className="flex items-center gap-1 bg-muted/50 border border-border px-2 rounded-lg w-20">
              <Input 
                type="number" 
                min="0" max="50" step="0.1"
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value))}
                className="bg-transparent border-none h-8 px-0 text-right w-full font-bold focus-visible:ring-0"
              />
              <span className="text-foreground font-bold text-sm">%</span>
            </div>
          </Label>
        </div>

        <div className="space-y-3">
          <Label className="text-sm font-semibold flex justify-between">
            <span className="text-muted-foreground">{t("listing.duration")}</span>
            <span className="text-foreground font-bold">{years} {t("common.year")}</span>
          </Label>
          <Input 
            type="range" 
            min="1" max="30" step="1"
            value={years}
            onChange={(e) => setYears(Number(e.target.value))}
            className="w-full accent-primary h-2"
          />
          <div className="text-xs text-muted-foreground font-bold text-center mt-2">
            ({years * 12} {t("common.month")})
          </div>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground font-semibold mb-1 uppercase tracking-wider">{t("listing.est_monthly_payment")}</p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-foreground tracking-tight">{monthlyPayment.toLocaleString("en-US", { maximumFractionDigits: 0 })}</span>
            <span className="font-bold text-muted-foreground">{t("common.usd_per_month")}</span>
          </div>
        </div>
        <div className="bg-primary/5 text-primary px-5 py-3 rounded-2xl text-sm font-bold border border-primary/20 text-center w-full md:w-auto shadow-inner">
          ~ {(monthlyPayment * 12600).toLocaleString("en-US", { maximumFractionDigits: 0 })} {t("common.uzs_per_month")}
        </div>
      </div>
    </div>
  );
}
