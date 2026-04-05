import { ShieldAlert, Send, LogOut, MessageCircle, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { SignOutButton } from "@clerk/nextjs";

export default function BlockedPage() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex flex-col items-center justify-center p-6 text-center">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-500/5 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full animate-pulse delay-700" />
      
      <div className="relative max-w-[540px] w-full space-y-8 animate-in fade-in zoom-in duration-700">
        {/* Icon Header */}
        <div className="relative mx-auto w-28 h-28 flex items-center justify-center">
          <div className="absolute inset-0 bg-red-500/20 blur-2xl rounded-full scale-110" />
          <div className="relative w-full h-full bg-red-500/10 rounded-full flex items-center justify-center border-2 border-red-500/20 shadow-2xl">
            <ShieldAlert className="h-14 w-14 text-red-500" />
          </div>
        </div>

        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest mb-2">
            Xavfsizlik Bildirishnomasi
          </div>
          <h1 className="text-5xl font-black text-foreground tracking-tight leading-[1.1]">
            Siz <span className="text-red-500 italic">Bloklangansiz</span>
          </h1>
          <p className="text-muted-foreground text-lg font-medium leading-relaxed max-w-[440px] mx-auto">
            Sizning hisobingiz platforma xavfsizligi va qoidalarini buzgani uchun vaqtincha cheklandi.
          </p>
        </div>

        {/* Main Interaction Card */}
        <div className="p-10 bg-card/40 backdrop-blur-xl rounded-[40px] border border-border/50 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <HelpCircle className="h-24 w-24" />
          </div>
          
          <div className="relative space-y-8">
            <div className="space-y-2">
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-[0.2em]">Qo'llab-quvvatlash xizmati</p>
              <p className="text-2xl font-black text-foreground">Blokdan chiqarish uchun murojaat qiling:</p>
            </div>
            
            <div className="grid gap-4">
              <a 
                href="https://t.me/Akmalovic_sh" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="block"
              >
                <Button className="w-full h-16 rounded-2xl text-lg font-bold gap-3 shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 bg-gradient-to-r from-primary to-primary/90">
                  <MessageCircle className="h-6 w-6" />
                  Telegram: @Akmalovic_sh
                </Button>
              </a>
              
              <SignOutButton>
                <Button variant="outline" className="w-full h-14 rounded-2xl font-bold gap-2 border-border/60 hover:bg-red-50 hover:text-red-500 hover:border-red-200 hover:scale-[1.01] active:scale-[0.99] transition-all duration-300">
                  <LogOut className="h-5 w-5" />
                  Hisobdan chiqish
                </Button>
              </SignOutButton>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 text-muted-foreground/60 text-[10px] font-bold uppercase tracking-widest pt-4">
          <ShieldAlert className="h-3 w-3" />
          UySell Xavfsizlik Tizimi
        </div>
      </div>
    </div>
  );
}
