"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { setUserRoleAction } from "@/server/actions/onboarding.action";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";

export default function OnboardingPage() {
  const router = useRouter();
  const { isLoaded, user } = useUser();
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<"SELLER" | "REALTOR" | null>(null);

  const handleComplete = async () => {
    if (!selectedRole) return;
    setLoading(true);

    const res = await setUserRoleAction(selectedRole);
    if (res.success) {
      toast.success("Muvaffaqiyatli saqlandi!");
      // Since publicMetadata updates may take a moment to sync down to the client session,
      // we can explicitly reload.
      await user?.reload();
      router.push("/");
      router.refresh();
    } else {
      toast.error(res.error || "Xatolik yuz berdi");
      setLoading(false);
    }
  };

  if (!isLoaded) return <div className="min-h-screen flex items-center justify-center">Yuklanmoqda...</div>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4 py-12">
      <div className="max-w-xl w-full bg-background rounded-[32px] p-8 md:p-12 shadow-2xl border border-border/50 text-center relative overflow-hidden">
        {/* Background blobs */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-primary/10 rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl opacity-50" />

        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-4">
            Xush kelibsiz! 👋
          </h1>
          <p className="text-muted-foreground font-medium mb-10 text-[15px] leading-relaxed">
            Platformadan qanday maqsadda foydalanmoqchisiz? Iltimos, profilingiz turini tanlang.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 mb-10">
            {/* Seller Option */}
            <button
              onClick={() => setSelectedRole("SELLER")}
              className={`flex flex-col items-center justify-center p-8 rounded-3xl border-2 transition-all duration-300 ${
                selectedRole === "SELLER"
                  ? "border-primary bg-primary/5 shadow-lg shadow-primary/10 scale-105"
                  : "border-border/50 bg-card hover:border-primary/30 hover:bg-muted/50"
              }`}
            >
              <div
                className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-5 ${
                  selectedRole === "SELLER"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                } transition-colors`}
              >
                <User className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">Oddiy sotuvchi</h3>
              <p className="text-[13px] text-muted-foreground/80 leading-snug">
                O'zimning shaxsiy uyimni yoki mulkimni sotmoqchiman.
              </p>
            </button>

            {/* Realtor Option */}
            <button
              onClick={() => setSelectedRole("REALTOR")}
              className={`flex flex-col items-center justify-center p-8 rounded-3xl border-2 transition-all duration-300 ${
                selectedRole === "REALTOR"
                  ? "border-blue-500 bg-blue-500/5 shadow-lg shadow-blue-500/10 scale-105"
                  : "border-border/50 bg-card hover:border-blue-500/30 hover:bg-muted/50"
              }`}
            >
              <div
                className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-5 ${
                  selectedRole === "REALTOR"
                    ? "bg-blue-500 text-white"
                    : "bg-muted text-muted-foreground"
                } transition-colors`}
              >
                <Building2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">Rieltor</h3>
              <p className="text-[13px] text-muted-foreground/80 leading-snug">
                Mijozlar mulkini sotuvchi professional agentman.
              </p>
            </button>
          </div>

          <Button
            size="lg"
            disabled={!selectedRole || loading}
            onClick={handleComplete}
            className={`w-full h-14 rounded-2xl text-lg font-bold shadow-xl transition-all ${
              selectedRole === "REALTOR" ? "bg-blue-500 hover:bg-blue-600 shadow-blue-500/20" : "shadow-primary/20"
            }`}
          >
            {loading ? "Saqlanmoqda..." : "Davom etish"}
          </Button>
        </div>
      </div>
    </div>
  );
}
