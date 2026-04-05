import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { 
  LayoutDashboard, 
  Users, 
  Home, 
  Settings, 
  LogOut, 
  MonitorPlay, 
  ChevronRight,
  Bell,
  Search,
  BookOpen,
  PieChart
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  let user;
  try {
    user = await currentUser();
  } catch (error) {
    console.error("Clerk currentUser error:", error);
    // If Clerk fails, redirect to home to avoid crashing the whole layout
    redirect("/");
  }
  
  if (!user || user.emailAddresses[0]?.emailAddress !== "shahuztech@gmail.com") {
    redirect("/");
  }

  const navItems = [
    { label: "Bosh sahifa", href: "/admin", icon: LayoutDashboard, active: true },
    { label: "Bannernlar", href: "/admin/banners", icon: MonitorPlay },
    { label: "Hikoyalar", href: "/admin/stories", icon: BookOpen },
    { label: "Statistika", href: "/admin/stats", icon: PieChart },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row antialiased">
      {/* Sidebar Overlay for Mobile */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white dark:bg-slate-900 border-b border-border/50 sticky top-0 z-50">
         <h2 className="text-xl font-black text-primary tracking-tight">Admin <span className="text-foreground">Panel</span></h2>
         <ThemeToggle />
      </div>

      {/* Sidebar */}
      <aside className="w-full md:w-72 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border-r border-border/50 shrink-0 flex flex-col sticky top-0 h-screen hidden md:flex">
        <div className="p-8">
          <Link href="/" className="group">
            <h2 className="text-2xl font-black text-primary tracking-tight transition-transform group-hover:scale-105">UY <span className="text-foreground">SELL</span></h2>
            <p className="text-[10px] text-muted-foreground font-black mt-1 uppercase tracking-[0.2em] opacity-60">Control Center</p>
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto pt-4">
          <div className="px-4 mb-4">
            <p className="text-[10px] font-black text-muted-foreground/50 uppercase tracking-widest">Asosiy Menu</p>
          </div>
          
          {navItems.map((item) => (
            <Link 
              key={item.href} 
              href={item.href} 
              className={cn(
                "flex items-center justify-between px-4 py-3.5 rounded-2xl font-bold transition-all group",
                item.active 
                  ? "bg-primary/10 text-primary shadow-sm" 
                  : "text-muted-foreground hover:bg-primary/5 hover:text-primary"
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon className={cn("h-5 w-5 transition-transform group-hover:scale-110", item.active ? "text-primary" : "text-muted-foreground/60 group-hover:text-primary")} />
                <span className="text-[15px]">{item.label}</span>
              </div>
              {item.active && <div className="h-1.5 w-1.5 rounded-full bg-primary" />}
            </Link>
          ))}

          <div className="pt-8 px-4 mb-4">
            <p className="text-[10px] font-black text-muted-foreground/50 uppercase tracking-widest">Boshqa</p>
          </div>
          
          <Link href="/" className="flex items-center gap-3 px-4 py-3.5 text-muted-foreground hover:bg-muted hover:text-foreground rounded-2xl font-bold transition-all group">
            <Home className="h-5 w-5 text-muted-foreground/60 group-hover:text-foreground" />
            <span className="text-[15px]">Saytga qaytish</span>
          </Link>
        </nav>

        <div className="p-6 mt-auto">
          <div className="bg-gradient-to-br from-primary/10 to-transparent p-5 rounded-3xl border border-primary/10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 -mr-4 -mt-4 h-16 w-16 bg-primary/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
            <p className="text-xs font-black text-primary uppercase mb-1">PRO Plan</p>
            <p className="text-[10px] text-muted-foreground leading-tight">Cheksiz reklama va ustuvorlik yoqilgan.</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-[88px] bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border-b border-border/50 px-8 flex items-center justify-between sticky top-0 z-40 hidden md:flex">
          <div className="flex items-center gap-4 bg-muted/40 border border-border/50 px-4 py-2.5 rounded-2xl w-96 group focus-within:border-primary/50 transition-all">
            <Search className="h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input 
              placeholder="Qidiruv..." 
              className="bg-transparent border-none outline-none text-sm font-medium w-full placeholder:text-muted-foreground/60"
            />
          </div>

          <div className="flex items-center gap-5">
            <div className="flex items-center gap-2">
               <ThemeToggle />
               <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-primary/5 text-muted-foreground hover:text-primary">
                 <Bell className="h-5 w-5" />
               </Button>
            </div>
            <div className="h-8 w-px bg-border/50 mx-1" />
            <div className="flex items-center gap-3 pl-2">
              <div className="text-right">
                <p className="text-sm font-black text-foreground leading-none">Shahzod</p>
                <p className="text-[10px] font-bold text-muted-foreground mt-1 uppercase tracking-tighter">Bosh Admin</p>
              </div>
              <div className="h-11 w-11 rounded-2xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-black shadow-lg shadow-primary/5 relative group cursor-pointer hover:scale-105 transition-all">
                SH
                <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full" />
              </div>
            </div>
          </div>
        </header>

        <div className="p-6 md:p-10 3xl:p-20 flex-1 overflow-x-hidden">
          {children}
        </div>
      </main>
    </div>
  );
}
