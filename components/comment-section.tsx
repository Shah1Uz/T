"use client";

import { useState } from "react";
import { useUser, SignInButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2, Heart, Reply } from "lucide-react";

import { useLocale } from "@/context/locale-context";

type CommentUser = {
  id: string;
  name: string | null;
  imageUrl: string | null;
};

type CommentLike = {
  id: string;
  userId: string;
};

export type CommentType = {
  id: string;
  text: string;
  createdAt: string;
  userId: string;
  user: CommentUser;
  likes: CommentLike[];
  replies?: CommentType[];
};

export default function CommentSection({ listingId, comments: initialComments }: { listingId: string; comments: CommentType[] }) {
const { user, isLoaded } = useUser();
  const { t } = useLocale();
  const [comments, setComments] = useState<CommentType[]>(initialComments || []);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  const handleSubmit = async (parentId?: string) => {
    const textToSubmit = parentId ? replyText : newComment;
    if (!textToSubmit.trim() || !user) return;
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        body: JSON.stringify({ text: textToSubmit, listingId, parentId }),
      });
      if (res.ok) {
        const comment = await res.json();
        
        if (parentId) {
          setComments(comments.map(c => {
            if (c.id === parentId) {
              return { ...c, replies: [...(c.replies || []), comment] };
            }
            return c;
          }));
          setReplyingTo(null);
          setReplyText("");
        } else {
          setComments([comment, ...comments]);
          setNewComment("");
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, parentId?: string) => {
    if (!confirm(t("comments.delete_confirm") || "O'chirishni tasdiqlaysizmi?")) return;
    const res = await fetch(`/api/comments/${id}`, { method: "DELETE" });
    if (res.ok) {
      if (parentId) {
        setComments(comments.map(c => {
          if (c.id === parentId) {
            return { ...c, replies: (c.replies || []).filter(r => r.id !== id) };
          }
          return c;
        }));
      } else {
        setComments(comments.filter((c) => c.id !== id));
      }
    }
  };

  const handleLike = async (commentId: string, parentId?: string) => {
    if (!user) return alert(t("comments.login_to_comment") || "Avval tizimga kiring!");
    
    // Optimistic toggle
    const toggleLike = (c: CommentType) => {
      const hasLiked = c.likes?.some(l => l.userId === user.id);
      let newLikes = [...(c.likes || [])];
      if (hasLiked) {
        newLikes = newLikes.filter(l => l.userId !== user.id);
      } else {
        newLikes.push({ id: "temp", userId: user.id });
      }
      return { ...c, likes: newLikes };
    };

    if (parentId) {
      setComments(comments.map(c => c.id === parentId ? {
        ...c,
        replies: (c.replies || []).map(r => r.id === commentId ? toggleLike(r) : r)
      } : c));
    } else {
      setComments(comments.map(c => c.id === commentId ? toggleLike(c) : c));
    }

    try {
      await fetch(`/api/comments/${commentId}/like`, { method: "POST" });
    } catch {
      // Revert if failed (simplified for now)
    }
  };

  const renderComment = (comment: CommentType, isReply = false, parentId?: string) => {
    const isLiked = comment.likes?.some(l => l.userId === user?.id);
    const likeCount = comment.likes?.length || 0;

    return (
      <div key={comment.id} className={`${isReply ? "mt-4 ml-6 sm:ml-12 border-l-2 pl-4 border-border" : ""}`}>
        <Card className={`border border-white/5 bg-background shadow-sm hover:shadow-md transition-shadow duration-300 rounded-3xl overflow-hidden ${isReply ? 'bg-muted/50' : ''}`}>
          <CardContent className="p-5 md:p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-4">
                {comment.user?.imageUrl ? (
                  <img src={comment.user.imageUrl} alt={comment.user.name || "User"} className="h-10 w-10 sm:h-12 sm:w-12 rounded-full object-cover shadow-sm border border-white/10" />
                ) : (
                  <div className="h-10 w-10 sm:h-12 w-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center font-black text-primary border border-primary/20 shadow-inner uppercase text-sm sm:text-lg">
                    {comment.user?.name ? comment.user.name.substring(0, 2).toUpperCase() : "FO"}
                  </div>
                )}
                <div>
                  <div className="font-extrabold text-foreground tracking-tight">{comment.user?.name || "Foydalanuvchi"}</div>
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mt-0.5">{new Date(comment.createdAt).toLocaleDateString()}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-1 sm:gap-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleLike(comment.id, parentId)}
                  className={`h-9 rounded-full px-2 sm:px-3 gap-1.5 transition-colors ${isLiked ? "text-red-500 hover:text-red-600 hover:bg-red-500/200/10" : "text-muted-foreground hover:text-foreground"}`}
                >
                  <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
                  <span className="font-bold">{likeCount > 0 ? likeCount : ""}</span>
                </Button>
                
                {user?.id === comment.userId && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleDelete(comment.id, parentId)}
                    className="h-9 w-9 rounded-full text-destructive hover:text-white hover:bg-destructive transition-colors shrink-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
            
            <p className="text-base text-muted-foreground leading-relaxed md:pl-[64px] break-words whitespace-pre-wrap">{comment.text}</p>
            
            {!isReply && user && (
              <div className="md:pl-[64px] mt-3">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                  className="h-8 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors hover:bg-primary/10 rounded-full"
                >
                  <Reply className="h-3.5 w-3.5 mr-1.5" />
                  {replyingTo === comment.id ? (t("common.cancel") || "Bekor qilish") : (t("comments.reply") || "Javob berish")}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Reply Input Form */}
        {replyingTo === comment.id && !isReply && (
          <div className="mt-4 ml-6 sm:ml-12 border-l-2 pl-4 border-border animate-in fade-in slide-in-from-top-2">
            <div className="space-y-3 bg-muted/10 p-4 rounded-2xl border border-white/10">
              <Textarea 
                placeholder="Fikrga javob yozish..." 
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="min-h-[80px] rounded-xl border-2 focus-visible:ring-primary focus-visible:border-primary transition-all resize-none text-sm p-3"
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => setReplyingTo(null)} className="rounded-full font-bold">Bekor qilish</Button>
                <Button 
                  size="sm" 
                  onClick={() => handleSubmit(comment.id)} 
                  disabled={isSubmitting || !replyText.trim()}
                  className="rounded-full font-bold shadow-sm"
                >
                  Javob yozish
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Nested Replies */}
        {!isReply && comment.replies && comment.replies.length > 0 && (
          <div className="space-y-3 mt-3">
            {comment.replies.map(reply => renderComment(reply, true, comment.id))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8 pt-10 border-t border-border/50">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">{t("comments.title") || "Fikrlar"} <span className="text-muted-foreground font-medium text-lg ml-2">({comments.length})</span></h2>
      </div>
      
      {!isLoaded ? (
        <div className="h-32 w-full bg-muted/20 animate-pulse rounded-3xl" />
      ) : user ? (
        <div className="space-y-4 bg-muted/20 p-5 md:p-6 rounded-3xl border border-white/10 shadow-sm">
          <Textarea 
            placeholder={t("comments.placeholder") || "Izohingizni yozing..."} 
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="min-h-[120px] rounded-2xl border-2 focus-visible:ring-primary focus-visible:border-primary transition-all resize-none text-base p-4"
          />
          <div className="flex justify-end">
            <Button 
              onClick={() => handleSubmit()} 
              disabled={isSubmitting || !newComment.trim()}
              className="rounded-full px-8 h-12 font-bold shadow-md hover:shadow-lg transition-all"
            >
              {t("comments.add") || "Yuborish"}
            </Button>
          </div>
        </div>
      ) : (
        <div className="p-8 bg-gradient-to-br from-muted/50 to-muted/10 border border-dashed rounded-3xl text-center">
          <p className="text-muted-foreground font-medium mb-4">{t("comments.login_to_comment") || "Fikr qoldirish uchun tizimga kiring"}</p>
          <SignInButton mode="modal">
            <Button variant="outline" className="rounded-full px-8 font-bold border-2">{t("nav.login") || "Tizimga kirish"}</Button>
          </SignInButton>
        </div>
      )}

      <div className="space-y-6">
        {comments.map((comment) => renderComment(comment))}
      </div>
    </div>
  );
}
