"use client";

import { useState, useEffect } from "react";

import { Users, Home, Eye, MessageSquare, Trash2, ShieldCheck, Mail, Calendar, Phone, AlertTriangle, CheckCircle, Ban, Unlock, MoreVertical, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  toggleUserVerificationAction, 
  toggleUserBlockAction,
  changeUserPlanAction
} from "@/server/actions/admin.action";
import { Loader2, ShieldCheck as ShieldCheckIcon, ShieldAlert, ChevronDown } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface AdminClientProps {
  stats: {
    totalUsers: number;
    totalListings: number;
    totalViews: number;
    totalComments: number;
  };
  listingsData: {
    listings: any[];
    total: number;
    pages: number;
  };
  usersData: {
    users: any[];
    total: number;
    pages: number;
  };
}

export default function AdminClient({ stats, listingsData, usersData }: AdminClientProps) {
  const { listings } = listingsData;
  const { users } = usersData;
  const [activeTab, setActiveTab] = useState("listings");
  const searchParams = useSearchParams();
  const [reports, setReports] = useState<any[]>([]);
  const [isLoadingReports, setIsLoadingReports] = useState(false);
  const [isDeletingListing, setIsDeletingListing] = useState<string | null>(null);
  const [isBlockingUser, setIsBlockingUser] = useState<{id: string, name: string, isBlocked: boolean} | null>(null);
  const router = useRouter();

  const fetchReports = async () => {
    setIsLoadingReports(true);
    try {
      const res = await fetch("/api/admin/reports");
      if (res.ok) {
        const data = await res.json();
        setReports(data);
      }
    } catch {
      toast.error("Hisobotlarni yuklashda xatolik!");
    } finally {
      setIsLoadingReports(false);
    }
  };

  useEffect(() => {
    if (activeTab === "reports") {
      fetchReports();
    }
  }, [activeTab]);
  
  const handleDeleteListing = async (id: string) => {
    try {
      const res = await fetch(`/api/listings/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("E'lon o'chirildi");
        setIsDeletingListing(null);
        if (activeTab === "reports") {
          fetchReports();
        }
        router.refresh();
      } else {
        toast.error("Xatolik yuz berdi!");
      }
    } catch {
      toast.error("Tarmoq xatosi!");
    }
  };

  const handleToggleVerification = async (id: string, currentStatus: boolean) => {
    try {
      const res = await toggleUserVerificationAction(id, !currentStatus);
      if (res.success) {
        router.refresh();
      } else {
        alert("Xatolik: " + res.error);
      }
    } catch {
      alert("Tarmoq xatosi!");
    }
  };

  const handleDismissReport = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/reports?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Hisobot olib tashlandi");
        fetchReports();
      }
    } catch {
      toast.error("Xatolik yuz berdi");
    }
  };

  const handleToggleBlock = async (id: string, currentStatus: boolean) => {
    try {
      const res = await toggleUserBlockAction(id, !currentStatus);
      if (res.success) {
        toast.success(currentStatus ? "Blokdan chiqarildi" : "Bloklandi");
        setIsBlockingUser(null);
        router.refresh();
      } else {
        toast.error("Xatolik: " + res.error);
      }
    } catch {
      toast.error("Tarmoq xatosi!");
    }
  };

  const handleChangePlan = async (id: string, newPlan: string) => {
    toast.promise(changeUserPlanAction(id, newPlan, 30), {
      loading: 'Tarif o\'zgartirilmoqda...',
      success: () => {
        router.refresh();
        return 'Tarif muvaffaqiyatli o\'zgartirildi';
      },
      error: 'Xatolik yuz berdi'
    });
  };

  return (
    <div className="space-y-12">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-5xl font-black text-foreground tracking-tight">Xush kelibsiz! 👋</h1>
          <p className="text-muted-foreground font-semibold mt-2">Barcha e'lonlar va foydalanuvchilar shu yerda boshqariladi.</p>
        </div>
        <div className="flex items-center gap-3 bg-white dark:bg-slate-900 px-4 py-2.5 rounded-2xl border border-border/50 shadow-sm">
           <Calendar className="h-4 w-4 text-primary" />
           <span className="text-sm font-bold">{new Date().toLocaleDateString("uz-UZ", { day: 'numeric', month: 'long', year: 'numeric' })}</span>
        </div>
      </div>

      {/* Modern Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Foydalanuvchilar", value: stats.totalUsers, icon: Users, color: "blue" },
          { label: "E'lonlar", value: stats.totalListings, icon: Home, color: "indigo" },
          { label: "Ko'rishlar", value: stats.totalViews, icon: Eye, color: "emerald" },
          { label: "Izohlar", value: stats.totalComments, icon: MessageSquare, color: "violet" },
        ].map((s, i) => (
          <div key={i} className="group bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-border/50 shadow-sm hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-300">
            <div className={`h-12 w-12 rounded-2xl bg-${s.color}-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
              <s.icon className={`h-6 w-6 text-${s.color}-500`} />
            </div>
            <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest leading-none">{s.label}</p>
            <h3 className="text-3xl font-black text-foreground mt-3 tabular-nums">{s.value.toLocaleString()}</h3>
          </div>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="bg-transparent">
        <TabsList className="bg-muted/30 p-1.5 rounded-2xl border border-border/50 h-auto gap-1 mb-8">
          <TabsTrigger value="listings" className="rounded-xl font-bold py-2.5 px-6 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-lg data-[state=active]:text-primary transition-all">E'lonlar</TabsTrigger>
          <TabsTrigger value="users" className="rounded-xl font-bold py-2.5 px-6 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-lg data-[state=active]:text-primary transition-all">Foydalanuvchilar</TabsTrigger>
          <TabsTrigger value="reports" className="rounded-xl font-bold py-2.5 px-6 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-lg data-[state=active]:text-primary transition-all flex items-center gap-2">
            Hisobotlar
            {reports.length > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-black text-white animate-pulse">
                {reports.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="listings" className="space-y-4 focus-visible:outline-none">
          <div className="bg-white dark:bg-slate-900 border border-border/50 rounded-[32px] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-[10px] text-muted-foreground uppercase bg-muted/20 border-b border-border/50">
                  <tr>
                    <th className="px-8 py-5 font-black tracking-widest">E'lon haqida</th>
                    <th className="px-8 py-5 font-black tracking-widest">Sotuvchi</th>
                    <th className="px-8 py-5 font-black tracking-widest">Narxi</th>
                    <th className="px-8 py-5 font-black tracking-widest text-right">Boshqaruv</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {listings.map((l) => (
                    <tr key={l.id} className="hover:bg-primary/[0.02] transition-colors group/row">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="h-16 w-16 relative rounded-2xl overflow-hidden shrink-0 border border-border/50 shadow-sm group-hover/row:scale-105 transition-transform duration-500">
                            <Image 
                              src={l.images?.[0]?.url || "/placeholder-property.jpg"} 
                              alt="Property" fill className="object-cover" 
                            />
                          </div>
                          <div>
                            <p className="font-black text-foreground group-hover/row:text-primary transition-colors line-clamp-1">{l.title}</p>
                            <div className="flex items-center gap-2 mt-1.5">
                              <span className="px-2 py-0.5 rounded-lg bg-primary/5 text-[9px] font-black uppercase tracking-widest text-primary border border-primary/10">
                                {l.category === "new" ? "Yangi bino" : "Ikkilamchi"}
                              </span>
                              <span className="text-[10px] text-muted-foreground/40">•</span>
                              <p className="text-[10px] text-muted-foreground font-bold">{l._count?.views || 0} ko'rishlar</p>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 border-2 border-primary/10 shadow-sm">
                            <AvatarImage src={l.user?.imageUrl || ""} alt={l.user?.name || "U"} />
                            <AvatarFallback className="text-xs bg-primary/5 text-primary font-black">
                              {l.user?.name?.[0] || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-bold text-sm text-foreground">{l.user?.name || "Noma'lum"}</p>
                            <p className="text-[10px] text-muted-foreground/60 font-medium">Sotuvchi</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className="text-lg font-black text-foreground tabular-nums">
                          {(l.price || 0).toLocaleString("en-US")}
                          <span className="text-xs ml-1 text-muted-foreground font-bold">USD</span>
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <Button 
                          onClick={() => setIsDeletingListing(l.id)}
                          variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-destructive hover:bg-destructive/10 transition-all active:scale-90"
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {listings.length === 0 && (
                     <tr>
                       <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">E'lonlar topilmadi.</td>
                     </tr>
                  )}
                </tbody>
              </table>
            </div>
            {listingsData.pages > 1 && (
              <div className="flex items-center justify-between px-8 py-5 bg-muted/5 border-t border-border/50">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 mb-0.5 leading-none">Status</span>
                  <span className="text-[11px] font-bold text-muted-foreground italic leading-none">
                    Jami {listingsData.total} ta e'londan {listings.length} tasi ko'rsatilmoqda
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Button 
                    variant="outline" size="sm" className="h-10 w-10 rounded-xl p-0 border-border/60 hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                    disabled={!searchParams.get("listingPage") || searchParams.get("listingPage") === "1"}
                    onClick={() => {
                      const params = new URLSearchParams(searchParams);
                      const current = Number(params.get("listingPage")) || 1;
                      params.set("listingPage", (current - 1).toString());
                      router.push(`/admin?${params.toString()}`);
                    }}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  
                  <div className="flex items-center gap-1 px-3">
                    <span className="text-sm font-black text-foreground">{searchParams.get("listingPage") || 1}</span>
                    <span className="text-[10px] font-bold text-muted-foreground/40 mx-1">/</span>
                    <span className="text-sm font-bold text-muted-foreground/60">{listingsData.pages}</span>
                  </div>

                  <Button 
                    variant="outline" size="sm" className="h-10 w-10 rounded-xl p-0 border-border/60 hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                    disabled={Number(searchParams.get("listingPage") || 1) >= listingsData.pages}
                    onClick={() => {
                      const params = new URLSearchParams(searchParams);
                      const current = Number(params.get("listingPage")) || 1;
                      params.set("listingPage", (current + 1).toString());
                      router.push(`/admin?${params.toString()}`);
                    }}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-4 focus-visible:outline-none">
          <div className="bg-white dark:bg-slate-900 border border-border/50 rounded-[32px] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-[10px] text-muted-foreground uppercase bg-muted/20 border-b border-border/50">
                  <tr>
                    <th className="px-8 py-5 font-black tracking-widest text-left">Foydalanuvchi</th>
                    <th className="px-8 py-5 font-black tracking-widest text-center">Tarif</th>
                    <th className="px-8 py-5 font-black tracking-widest text-center">Muddati</th>
                    <th className="px-8 py-5 font-black tracking-widest text-center">E'lonlari</th>
                    <th className="px-8 py-5 font-black tracking-widest text-center">Izohlari</th>
                    <th className="px-8 py-5 font-black tracking-widest text-right">Boshqaruv</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-primary/[0.02] transition-colors group/row">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-10 w-10 border-2 border-primary/10 shadow-sm transition-transform group-hover/row:scale-105">
                            <AvatarImage src={u.imageUrl || ""} alt={u.name || "U"} />
                            <AvatarFallback className="bg-primary/5 text-primary font-black uppercase">
                              {u.name?.[0] || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-bold whitespace-nowrap text-sm text-foreground">{u.name || "Noma'lum"}</p>
                            <p className="text-[10px] text-muted-foreground/60 font-mono tracking-tighter">{u.id.substring(0, 12)}...</p>
                            {u.trialUsed && <p className="text-[9px] text-amber-600 font-black uppercase tracking-tighter mt-0.5">Trial ishlatilgan</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-center">
                        <div className="flex flex-col items-center gap-1.5">
                          <DropdownMenu>
                            <DropdownMenuTrigger>
                              <div className="flex items-center gap-1 hover:brightness-110 active:scale-95 transition-all outline-none cursor-pointer">
                                <Badge variant={u.plan === "VIP" ? "default" : (u.plan === "EKONOM" || u.plan === "STANDART") ? "secondary" : "outline"} className={`text-[10px] font-black tracking-[0.05em] h-5 cursor-pointer ${
                                  u.plan === "VIP" ? "bg-amber-500 hover:bg-amber-600 border-none px-2.5 shadow-sm shadow-amber-500/10" : 
                                  u.plan === "STANDART" ? "bg-blue-600 hover:bg-blue-700 text-white border-none px-2.5 shadow-sm shadow-blue-600/10" :
                                  u.plan === "EKONOM" ? "bg-emerald-500 hover:bg-emerald-600 text-white border-none px-2.5 shadow-sm shadow-emerald-500/10" : "px-2.5"
                                }`}>
                                  {u.plan} <ChevronDown className="w-3 h-3 ml-1 opacity-70" />
                                </Badge>
                              </div>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="center" className="rounded-xl border-border/50 shadow-xl min-w-[130px]">
                              <DropdownMenuItem onClick={() => handleChangePlan(u.id, "FREE")} className="cursor-pointer font-bold text-xs justify-between">
                                FREE {u.plan === "FREE" && <CheckCircle className="w-3 h-3 text-muted-foreground" />}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleChangePlan(u.id, "EKONOM")} className="cursor-pointer font-bold text-xs text-emerald-600 justify-between">
                                EKONOM {u.plan === "EKONOM" && <CheckCircle className="w-3 h-3 text-emerald-600" />}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleChangePlan(u.id, "STANDART")} className="cursor-pointer font-bold text-xs text-blue-600 justify-between">
                                STANDART {u.plan === "STANDART" && <CheckCircle className="w-3 h-3 text-blue-600" />}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleChangePlan(u.id, "VIP")} className="cursor-pointer font-bold text-xs text-amber-500 justify-between">
                                VIP {u.plan === "VIP" && <CheckCircle className="w-3 h-3 text-amber-500" />}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                          <button
                            onClick={() => handleToggleVerification(u.id, !!u.isVerified)}
                            className="flex items-center gap-1 text-[9px] font-bold text-muted-foreground/60 hover:text-blue-500 transition-colors"
                          >
                            {u.isVerified ? (
                              <><ShieldCheckIcon className="w-2.5 h-2.5 text-blue-500" /> Tasdiqlangan</>
                            ) : (
                              <><ShieldAlert className="w-2.5 h-2.5 text-rose-400" /> Tasdiqlanmagan</>
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-center">
                        {u.planExpiresAt ? (
                          <div className="flex flex-col items-center leading-none">
                            <span className="text-xs font-black text-foreground tabular-nums">
                              {new Date(u.planExpiresAt).toLocaleDateString("uz-UZ")}
                            </span>
                            <span className="text-[10px] text-muted-foreground font-bold mt-1 uppercase tracking-tighter">
                              {Math.max(0, Math.ceil((new Date(u.planExpiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))} kun qoldi
                            </span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-muted-foreground font-black uppercase opacity-20 tracking-widest">—</span>
                        )}
                      </td>
                      <td className="px-8 py-5 text-center">
                        <span className="inline-flex items-center justify-center bg-blue-500/5 text-blue-600 dark:text-blue-400 font-black text-[12px] px-3 py-1 rounded-full border border-blue-500/10 tabular-nums">
                          {u._count?.listings || 0}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-center">
                        <span className="inline-flex items-center justify-center bg-violet-500/5 text-violet-600 dark:text-violet-400 font-black text-[12px] px-3 py-1 rounded-full border border-violet-500/10 tabular-nums">
                          {u._count?.comments || 0}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right">
                         <div className="flex items-center justify-end gap-1">
                            <Button
                               variant="ghost"
                               size="icon"
                               onClick={() => setIsBlockingUser({ id: u.id, name: u.name || "User", isBlocked: !!u.isBlocked })}
                               className={`h-10 w-10 rounded-xl transition-all active:scale-90 ${
                                 u.isBlocked 
                                 ? "text-red-500 hover:bg-red-500/10" 
                                 : "text-muted-foreground hover:bg-red-50/50 hover:text-red-500"
                               }`}
                            >
                               {u.isBlocked ? <Unlock className="w-5 h-5" /> : <Ban className="w-5 h-5" />}
                            </Button>
                            <Button
                               variant="ghost"
                               size="icon"
                               onClick={() => toast.info("Tez kunda!")}
                               className="h-10 w-10 rounded-xl text-muted-foreground hover:bg-muted active:scale-90"
                            >
                               <MoreVertical className="w-5 h-5" />
                            </Button>
                         </div>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                     <tr>
                       <td colSpan={6} className="px-8 py-12 text-center text-muted-foreground font-bold italic">Foydalanuvchilar topilmadi.</td>
                     </tr>
                  )}
                </tbody>
              </table>
            </div>
            {usersData.pages > 1 && (
              <div className="flex items-center justify-between px-8 py-5 bg-muted/5 border-t border-border/50">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 mb-0.5 leading-none">Status</span>
                  <span className="text-[11px] font-bold text-muted-foreground italic leading-none">
                    Jami {usersData.total} ta foydalanuvchidan {users.length} tasi ko'rsatilmoqda
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Button 
                    variant="outline" size="sm" className="h-10 w-10 rounded-xl p-0 border-border/60 hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                    disabled={!searchParams.get("userPage") || searchParams.get("userPage") === "1"}
                    onClick={() => {
                      const params = new URLSearchParams(searchParams);
                      const current = Number(params.get("userPage")) || 1;
                      params.set("userPage", (current - 1).toString());
                      router.push(`/admin?${params.toString()}`);
                    }}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  
                  <div className="flex items-center gap-1 px-3">
                    <span className="text-sm font-black text-foreground">{searchParams.get("userPage") || 1}</span>
                    <span className="text-[10px] font-bold text-muted-foreground/40 mx-1">/</span>
                    <span className="text-sm font-bold text-muted-foreground/60">{usersData.pages}</span>
                  </div>

                  <Button 
                    variant="outline" size="sm" className="h-10 w-10 rounded-xl p-0 border-border/60 hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                    disabled={Number(searchParams.get("userPage") || 1) >= usersData.pages}
                    onClick={() => {
                      const params = new URLSearchParams(searchParams);
                      const current = Number(params.get("userPage")) || 1;
                      params.set("userPage", (current + 1).toString());
                      router.push(`/admin?${params.toString()}`);
                    }}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4 focus-visible:outline-none">
          <div className="bg-white dark:bg-slate-900 border border-border/50 rounded-[32px] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-[10px] text-muted-foreground uppercase bg-muted/20 border-b border-border/50">
                  <tr>
                    <th className="px-8 py-5 font-black tracking-widest text-left">Hisobot haqida</th>
                    <th className="px-8 py-5 font-black tracking-widest text-left">Tegishli e'lon</th>
                    <th className="px-8 py-5 font-black tracking-widest text-right">Amallar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {reports.map((r: any) => (
                    <tr key={r.id} className="hover:bg-primary/[0.02] transition-colors group/row">
                      <td className="px-8 py-5">
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-2">
                             <Badge className={cn(
                               "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg border-none shadow-sm",
                               r.type === "SUSPICIOUS" ? "bg-red-500 text-white shadow-red-500/10" : "bg-amber-500 text-white shadow-amber-500/10"
                             )}>
                               {r.type === "SUSPICIOUS" ? "Shubhali" : "Sotilgan"}
                             </Badge>
                             <span className="text-[10px] text-muted-foreground/40 font-bold tabular-nums">
                               {new Date(r.createdAt).toLocaleString("uz-UZ", { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                             </span>
                          </div>
                          {r.message && <p className="text-xs font-bold text-foreground leading-tight max-w-[300px]">{r.message}</p>}
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-16 relative rounded-xl overflow-hidden shrink-0 border border-border/50 shadow-sm group-hover/row:scale-105 transition-transform duration-500">
                            <Image 
                              src={r.listing?.images?.[0]?.url || "/placeholder-property.jpg"} 
                              alt="Log" fill className="object-cover" 
                            />
                          </div>
                          <div>
                             <p className="font-black text-foreground line-clamp-1 text-sm group-hover/row:text-primary transition-colors">{r.listing?.title}</p>
                             <p className="text-[10px] text-muted-foreground/60 font-medium">Auto-generated via user report</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button 
                            onClick={() => handleDismissReport(r.id)}
                            variant="ghost" size="icon" className="h-10 w-10 p-0 rounded-xl text-emerald-500 hover:bg-emerald-500/10 active:scale-90 transition-all"
                          >
                            <CheckCircle className="h-5 w-5" />
                          </Button>
                          <Button 
                            onClick={() => setIsDeletingListing(r.listingId)}
                            variant="ghost" size="icon" className="h-10 w-10 p-0 rounded-xl text-destructive hover:bg-destructive/10 active:scale-90 transition-all"
                          >
                            <Trash2 className="h-5 w-5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {reports.length === 0 && !isLoadingReports && (
                     <tr>
                       <td colSpan={3} className="px-8 py-12 text-center text-muted-foreground font-bold italic">Yangi hisobotlar mavjud emas.</td>
                     </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Confirmation Dialogs */}
      <Dialog open={!!isDeletingListing} onOpenChange={(open) => !open && setIsDeletingListing(null)}>
        <DialogContent className="rounded-[32px] sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-center flex flex-col items-center gap-4">
              <div className="h-16 w-16 bg-red-500/10 rounded-full flex items-center justify-center border-2 border-red-500/20 shadow-xl shadow-red-500/10">
                <Trash2 className="h-8 w-8 text-red-500" />
              </div>
              E'lonni o'chirish
            </DialogTitle>
            <DialogDescription className="text-center text-muted-foreground font-medium pt-2">
              Siz ushbu e'lonni butunlay o'chirishni istaysizmi? Bu amalni ortga qaytarib bo'lmaydi.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:justify-center mt-6">
            <Button variant="outline" className="rounded-2xl h-12 flex-1 font-bold" onClick={() => setIsDeletingListing(null)}>Bekor qilish</Button>
            <Button variant="destructive" className="rounded-2xl h-12 flex-1 font-bold shadow-lg shadow-red-500/20" onClick={() => isDeletingListing && handleDeleteListing(isDeletingListing)}>O'chirish</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!isBlockingUser} onOpenChange={(open) => !open && setIsBlockingUser(null)}>
        <DialogContent className="rounded-[32px] sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-center flex flex-col items-center gap-4">
              <div className={`h-16 w-16 ${isBlockingUser?.isBlocked ? 'bg-emerald-500/10 border-emerald-500/20 shadow-emerald-500/10' : 'bg-red-500/10 border-red-500/20 shadow-red-500/10'} rounded-full flex items-center justify-center border-2 shadow-xl`}>
                {isBlockingUser?.isBlocked ? <Unlock className="h-8 w-8 text-emerald-500" /> : <Ban className="h-8 w-8 text-red-500" />}
              </div>
              {isBlockingUser?.isBlocked ? "Blokdan chiqarish" : "Foydalanuvchini bloklash"}
            </DialogTitle>
            <DialogDescription className="text-center text-muted-foreground font-medium pt-2">
              {isBlockingUser?.isBlocked 
                ? `${isBlockingUser.name} foydalanuvchisini blokdan chiqarmoqchimisiz?`
                : `${isBlockingUser?.name}ni bloklamoqchimisiz? Bloklanganda foydalanuvchining barcha e'lonlari avtomatik yashiriladi.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:justify-center mt-6">
            <Button variant="outline" className="rounded-2xl h-12 flex-1 font-bold" onClick={() => setIsBlockingUser(null)}>Bekor qilish</Button>
            <Button 
                className={`rounded-2xl h-12 flex-1 font-bold shadow-lg ${isBlockingUser?.isBlocked ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20' : 'bg-red-500 hover:bg-red-600 shadow-red-500/20 text-white'}`} 
                onClick={() => isBlockingUser && handleToggleBlock(isBlockingUser.id, isBlockingUser.isBlocked)}
            >
                {isBlockingUser?.isBlocked ? "Ochish" : "Bloklash"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
