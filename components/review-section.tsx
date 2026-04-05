"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useLocale } from "@/context/locale-context";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import StarRating from "./star-rating";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { uz, ru } from "date-fns/locale";
import { MessageSquare, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  reviewer: {
    id: string;
    name: string | null;
    imageUrl: string | null;
  };
}

interface ReviewSectionProps {
  userId: string;
  initialReviews: Review[];
}

export default function ReviewSection({ userId, initialReviews }: ReviewSectionProps) {
  const { user: currentUser } = useUser();
  const { locale, t } = useLocale();
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const averageRating = reviews.length > 0
    ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
    : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return alert(t("nav.login") || "Tizimga kiring!");
    
    setSubmitting(true);
    try {
      const res = await fetch(`/api/user/${userId}/reviews`, {
        method: "POST",
        body: JSON.stringify({ rating, comment })
      });
      if (res.ok) {
        const newReview = await res.json();
        setReviews([newReview, ...reviews]);
        setComment("");
        setRating(5);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (reviewId: string) => {
    if (!confirm(t("comments.delete_confirm") || "O'chirishni tasdiqlaysizmi?")) return;
    
    try {
      const res = await fetch(`/api/reviews/${reviewId}`, {
        method: "DELETE"
      });
      if (res.ok) {
        setReviews(reviews.filter(r => r.id !== reviewId));
        toast.success(locale === 'uz' ? "Sharh o'chirildi" : "Отзыв удален");
      } else {
        toast.error(locale === 'uz' ? "Xatolik yuz berdi" : "Произошла ошибка");
      }
    } catch (e) {
      console.error(e);
      toast.error(locale === 'uz' ? "Tarmoq xatosi" : "Ошибка сети");
    }
  };

  return (
    <div className="space-y-8">
      {/* Summary Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-8 bg-muted/30 rounded-[32px] border border-border/50">
        <div className="flex items-center gap-6">
          <div className="text-center">
            <p className="text-5xl font-black text-foreground">{averageRating.toFixed(1)}</p>
            <StarRating rating={averageRating} size={16} className="justify-center mt-2" />
          </div>
          <div className="h-12 w-px bg-border hidden md:block" />
          <div>
            <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
              {reviews.length} {t("profile.reviews") || 'sharhlar'}
            </p>
            <p className="text-xs text-muted-foreground font-medium mt-1">
              {locale === 'uz' ? 'Sotuvchining umumiy reytingi' : 'Общий рейтинг продавца'}
            </p>
          </div>
        </div>
        
        {currentUser?.id !== userId && (
          <Button onClick={() => document.getElementById("review-form")?.scrollIntoView({ behavior: "smooth" })} variant="outline" className="rounded-xl font-bold">
            {t("profile.leave_review") || 'Fikr qoldirish'}
          </Button>
        )}
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((r) => (
          <Card key={r.id} className="border-none bg-card/50 rounded-[24px] shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="relative h-10 w-10 rounded-full overflow-hidden border border-border">
                    <Image src={r.reviewer.imageUrl || "/placeholder-user.jpg"} fill alt="" className="object-cover" />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-foreground">{r.reviewer.name || "User"}</p>
                    <StarRating rating={r.rating} size={12} />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {currentUser?.id === r.reviewer.id && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleDelete(r.id)}
                      className="h-8 w-8 rounded-full text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">
                    {formatDistanceToNow(new Date(r.createdAt), { addSuffix: true, locale: locale === 'uz' ? uz : ru })}
                  </span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{r.comment}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Leave Review Form */}
      {currentUser && currentUser.id !== userId && (
        <div id="review-form" className="pt-8 border-t border-border">
          <h3 className="text-xl font-black text-foreground mb-6">
            {locale === 'uz' ? 'Fikr qoldirish' : 'Оставить отзыв'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">Reyting bering</label>
              <StarRating rating={rating} onRatingChange={setRating} size={32} />
            </div>
            <div className="space-y-2">
              <Textarea 
                placeholder={locale === 'uz' ? "O'z fikringizni yozing..." : "Напишите свой отзыв..."}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="rounded-2xl min-h-[120px] bg-muted/30 border-border focus:ring-primary"
              />
            </div>
            <Button disabled={submitting} type="submit" className="rounded-xl font-bold h-12 px-8">
              {submitting ? "Yuborilmoqda..." : (locale === 'uz' ? "Yuborish" : "Отправить")}
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}
