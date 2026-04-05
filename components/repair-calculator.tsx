"use client";

import { useState } from "react";
import { useLocale } from "@/context/locale-context";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Hammer, Info, PaintRoller, Sparkles } from "lucide-react";

interface RepairCalculatorProps {
  area: number;
}

export default function RepairCalculator({ area }: RepairCalculatorProps) {
  const { t } = useLocale();
  const validArea = area || 50; // Fallback to 50 sq.m.
  const [level, setLevel] = useState<"economy" | "standard" | "premium">("standard");

  // Rates in USD per sq meter (Material + Labor)
  const rates = {
    economy: 80,
    standard: 150,
    premium: 300,
  };

  const currentRate = rates[level];
  const estimatedCost = validArea * currentRate;

  return (
    <Card className="border-border shadow-md bg-card rounded-3xl overflow-hidden">
      <CardContent className="p-6 md:p-8">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
              <Hammer className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-black text-foreground text-lg">{t("listing.repair_calc")}</h3>
              <p className="text-sm text-muted-foreground font-medium">{t("listing.repair_desc")}</p>
            </div>
          </div>
          <div className="bg-muted/50 px-3 py-1.5 rounded-lg border border-border text-sm font-bold text-foreground">
            {t("common.area")}: {validArea} m²
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
          <Button 
            variant={level === "economy" ? "default" : "outline"}
            className={`h-auto py-3 px-4 flex-col gap-2 items-center justify-center rounded-2xl ${level === "economy" ? "bg-primary border-primary shadow-lg shadow-primary/20" : "border-border text-muted-foreground hover:border-primary/50"}`}
            onClick={() => setLevel("economy")}
          >
            <PaintRoller className={`h-5 w-5 ${level === "economy" ? "text-white" : "text-gray-400"}`} />
            <div className="text-center">
              <div className="font-bold">{t("listing.economy")}</div>
              <div className="text-[10px] opacity-80 uppercase tracking-widest mt-0.5">~${rates.economy}/m²</div>
            </div>
          </Button>

          <Button 
            variant={level === "standard" ? "default" : "outline"}
            className={`h-auto py-3 px-4 flex-col gap-2 items-center justify-center rounded-2xl ${level === "standard" ? "bg-primary border-primary shadow-lg shadow-primary/20" : "border-border text-muted-foreground hover:border-primary/50"}`}
            onClick={() => setLevel("standard")}
          >
            <Hammer className={`h-5 w-5 ${level === "standard" ? "text-white" : "text-gray-400"}`} />
            <div className="text-center">
              <div className="font-bold">{t("listing.standard")}</div>
              <div className="text-[10px] opacity-80 uppercase tracking-widest mt-0.5">~${rates.standard}/m²</div>
            </div>
          </Button>

          <Button 
            variant={level === "premium" ? "default" : "outline"}
            className={`h-auto py-3 px-4 flex-col gap-2 items-center justify-center rounded-2xl ${level === "premium" ? "bg-gray-900 border-gray-900 shadow-lg shadow-gray-900/20 text-white" : "border-border text-muted-foreground hover:border-gray-900/50 hover:text-foreground"}`}
            onClick={() => setLevel("premium")}
          >
            <Sparkles className={`h-5 w-5 ${level === "premium" ? "text-yellow-400" : "text-gray-400"}`} />
            <div className="text-center">
              <div className="font-bold">{t("listing.premium")}</div>
              <div className="text-[10px] opacity-80 uppercase tracking-widest mt-0.5">~${rates.premium}/m²</div>
            </div>
          </Button>
        </div>

        <div className="bg-muted/50 rounded-2xl p-5 border border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <div className="text-sm font-bold text-muted-foreground mb-1 uppercase tracking-widest">{t("listing.est_cost")}</div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-foreground tracking-tight">${estimatedCost.toLocaleString("en-US")}</span>
              <span className="text-sm font-bold text-muted-foreground">USD</span>
            </div>
            <p className="text-xs font-semibold text-gray-400 mt-1">{t("listing.labor_materials")}</p>
          </div>
          
          <div className="text-xs text-muted-foreground bg-card p-3 rounded-xl border border-border max-w-[220px] flex items-start gap-2 shadow-sm">
            <Info className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
            <p>{t("listing.estimate_notice")}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
