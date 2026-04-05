"use client";

import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle2, PhoneOff, Home, X } from "lucide-react";
import { toast } from "sonner";

interface CallFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  listingId: string;
}

export default function CallFeedbackModal({ isOpen, onClose, listingId }: CallFeedbackModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReport = async (type: string, message: string) => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId, type, message }),
      });

      if (res.ok) {
        toast.success("Rahmat! Ma'lumot adminga yuborildi.");
        onClose();
      } else {
        toast.error("Xatolik yuz berdi.");
      }
    } catch (error) {
      toast.error("Tarmoq xatosi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[450px] rounded-[32px] border-none shadow-2xl p-0 overflow-hidden bg-card/95 backdrop-blur-xl">
        <DialogHeader className="p-8 pb-4">
          <DialogTitle className="text-2xl font-black tracking-tight text-foreground flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <PhoneOff className="h-5 w-5 text-primary" />
            </div>
            Qo'ng'iroq qanday o'tdi?
          </DialogTitle>
          <DialogDescription className="text-muted-foreground font-medium pt-2">
            Ushbu e'lon bo'yicha fikringizni qoldiring. Bu bizga platformani toza saqlashga yordam beradi.
          </DialogDescription>
        </DialogHeader>

        <div className="p-8 pt-0 space-y-3">
          <Button 
            variant="outline" 
            className="w-full h-16 justify-start gap-4 rounded-2xl border-2 hover:border-red-500 hover:bg-red-500/5 group transition-all"
            onClick={() => handleReport("SUSPICIOUS", "Shubhali e'lon / Firibgarlik")}
            disabled={isSubmitting}
          >
            <div className="h-10 w-10 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0 group-hover:bg-red-500/20 transition-colors">
              <AlertTriangle className="h-5 w-5 text-red-500" />
            </div>
            <div className="text-left">
              <p className="font-bold text-foreground">Shubhali e'lon</p>
              <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">Firibgarlik yoki noto'g'ri ma'lumot</p>
            </div>
          </Button>

          <Button 
            variant="outline" 
            className="w-full h-16 justify-start gap-4 rounded-2xl border-2 hover:border-amber-500 hover:bg-amber-500/5 group transition-all"
            onClick={() => handleReport("SOLD", "Uy sotib bo'lingan")}
            disabled={isSubmitting}
          >
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0 group-hover:bg-amber-500/20 transition-colors">
              <Home className="h-5 w-5 text-amber-500" />
            </div>
            <div className="text-left">
              <p className="font-bold text-foreground">Uy sotilgan</p>
              <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">E'lon o'z dolzarbligini yo'qotgan</p>
            </div>
          </Button>

          <Button 
            variant="outline" 
            className="w-full h-16 justify-start gap-4 rounded-2xl border-2 hover:border-primary hover:bg-primary/5 group transition-all"
            onClick={() => {
              toast.success("Rahmat! Fikringiz qabul qilindi.");
              onClose();
            }}
            disabled={isSubmitting}
          >
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
              <CheckCircle2 className="h-5 w-5 text-primary" />
            </div>
            <div className="text-left">
              <p className="font-bold text-foreground">Hammasi joyida</p>
              <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">Sotuvchi bilan bog'landim</p>
            </div>
          </Button>
        </div>

        <DialogFooter className="p-8 pt-0 flex !justify-center">
          <Button variant="ghost" onClick={onClose} className="rounded-xl font-bold text-muted-foreground hover:text-foreground">
            Yopish
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
