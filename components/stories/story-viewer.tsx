"use client";

import { useState, useEffect, useCallback } from "react";
import { X, ChevronLeft, ChevronRight, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { recordStoryViewAction, toggleStoryLikeAction } from "@/server/actions/story.action";
import { Heart } from "lucide-react";

interface StoryViewerProps {
  stories: any[];
  initialIndex: number;
  onClose: () => void;
  onStoryViewed?: (storyId: string) => void;
}

export default function StoryViewer({ stories, initialIndex, onClose, onStoryViewed }: StoryViewerProps) {
  const [currentStoryIndex, setCurrentStoryIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(false); // Changed initial state to false as per common practice for video
  const [showLikeAnim, setShowLikeAnim] = useState(false);
  const currentStory = stories[currentStoryIndex];
  
  // Local state for optimistic updates
  const [likedStories, setLikedStories] = useState<Record<string, boolean>>(
    stories.reduce((acc, s) => ({ ...acc, [s.id]: !!s.isLiked }), {})
  );
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>(
    stories.reduce((acc, s) => ({ ...acc, [s.id]: s._count?.likes || 0 }), {})
  );

  const next = useCallback(() => {
    if (currentStoryIndex < stories.length - 1) {
      setCurrentStoryIndex(currentStoryIndex + 1);
      setProgress(0);
    } else {
      onClose();
    }
  }, [currentStoryIndex, stories.length, onClose]);

  const prev = useCallback(() => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(currentStoryIndex - 1);
      setProgress(0);
    }
  }, [currentStoryIndex]);

  useEffect(() => {
    if (!currentStory) return;
    
    // Mark as viewed in localStorage
    const viewedStr = localStorage.getItem("viewed_stories") || "[]";
    const viewed = JSON.parse(viewedStr);
    
    if (!viewed.includes(currentStory.id)) {
      viewed.push(currentStory.id);
      localStorage.setItem("viewed_stories", JSON.stringify(viewed));
      onStoryViewed?.(currentStory.id);
      
      // Record view in database
      recordStoryViewAction(currentStory.id).catch(console.error);
    }
  }, [currentStory, onStoryViewed]);

  const handleToggleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentStory) return;

    const isCurrentlyLiked = likedStories[currentStory.id];
    const newLiked = !isCurrentlyLiked;
    
    // Optimistic update
    setLikedStories(prev => ({ ...prev, [currentStory.id]: newLiked }));
    setLikeCounts(prev => ({ ...prev, [currentStory.id]: prev[currentStory.id] + (newLiked ? 1 : -1) }));

    if (newLiked) {
      setShowLikeAnim(true);
      setTimeout(() => setShowLikeAnim(false), 1000);
    }

    const res = await toggleStoryLikeAction(currentStory.id);
    if (!res.success) {
      // Revert on error
      setLikedStories(prev => ({ ...prev, [currentStory.id]: isCurrentlyLiked }));
      setLikeCounts(prev => ({ ...prev, [currentStory.id]: prev[currentStory.id] + (isCurrentlyLiked ? 1 : -1) }));
      alert("Xatolik: " + res.error);
    }
  };

  useEffect(() => {
    if (currentStory.videoUrl) return; // Skip auto-timer for videos

    const duration = 5000; // 5 seconds per story
    const interval = 50; 
    const step = (interval / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        const nextVal = prev + step;
        if (nextVal >= 100) {
          return 100; // Cap it so the effect below can trigger
        }
        return nextVal;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [currentStory.videoUrl, currentStoryIndex]);

  // Handle navigation when progress reaches 100%
  useEffect(() => {
    if (progress >= 100) {
      next();
    }
  }, [progress, next]);

  return (
    <div className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-xl flex items-center justify-center">
      {/* Progress Bars */}
      <div className="absolute top-4 left-0 right-0 px-4 flex gap-1 z-50">
        {stories.map((_, i) => (
          <div key={i} className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white transition-all duration-100 ease-linear"
              style={{ 
                width: i === currentStoryIndex ? `${progress}%` : i < currentStoryIndex ? "100%" : "0%" 
              }}
            />
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="absolute top-8 left-0 right-0 px-6 flex items-center justify-between z-50">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full border-2 border-white overflow-hidden">
            <img src={currentStory.user.imageUrl || "/default-avatar.png"} alt="" className="w-full h-full object-cover" />
          </div>
          <div className="text-white">
            <p className="font-bold text-sm">{currentStory.user.name || "Admin"}</p>
            <p className="text-[10px] opacity-60 font-medium">bugun qo'yildi</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
           {currentStory.videoUrl && (
             <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 rounded-full" onClick={() => setIsMuted(!isMuted)}>
               {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
             </Button>
           )}
           <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 rounded-full" onClick={onClose}>
             <X className="w-6 h-6" />
           </Button>
        </div>
      </div>

      {/* Navigation Areas */}
      <div className="absolute inset-0 flex z-40">
        <div className="flex-1 cursor-pointer" onClick={prev} />
        <div className="flex-1 cursor-pointer" onClick={next} />
      </div>

      {/* Content */}
      <div className="relative w-full max-w-lg aspect-[9/16] bg-black md:rounded-3xl overflow-hidden shadow-2xl">
         <AnimatePresence mode="wait">
            <motion.div
               key={currentStoryIndex}
               initial={{ opacity: 0, scale: 1.1, x: 20 }}
               animate={{ opacity: 1, scale: 1, x: 0 }}
               exit={{ opacity: 0, scale: 0.9, x: -20 }}
               transition={{ duration: 0.3 }}
               className="w-full h-full"
            >
              <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
              {/* Blurred Background */}
              <div className="absolute inset-0 z-0">
                {currentStory.videoUrl ? (
                  <video 
                    src={currentStory.videoUrl} 
                    className="w-full h-full object-cover blur-3xl opacity-50"
                    muted
                    loop
                    autoPlay
                    playsInline
                  />
                ) : (
                  <img 
                    src={currentStory.imageUrl} 
                    alt="" 
                    className="w-full h-full object-cover blur-3xl opacity-50" 
                  />
                )}
                <div className="absolute inset-0 bg-black/20" />
              </div>

              {/* Like/Heart Animation */}
        <AnimatePresence>
          {showLikeAnim && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1.5, opacity: 1 }}
              exit={{ scale: 2, opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none z-50"
            >
              <Heart className="w-32 h-32 text-red-500 fill-red-500 drop-shadow-2xl" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Story Content */}
              <div className="relative z-10 w-full h-full flex items-center justify-center">
                {currentStory.videoUrl ? (
                  <video
                    src={currentStory.videoUrl}
                    className="max-h-full w-full object-contain"
                    autoPlay
                    muted={isMuted}
                    playsInline
                    onEnded={next}
                    onTimeUpdate={(e) => {
                      const video = e.currentTarget;
                      if (video.duration) { // Ensure duration is available
                        const currentProgress = (video.currentTime / video.duration) * 100;
                        setProgress(currentProgress);
                      }
                    }}
                  />
                ) : (
                  <img
                    src={currentStory.imageUrl}
                    alt=""
                    className="max-h-full w-full object-contain shadow-2xl"
                  />
                )}
              </div>
            </div>
            </motion.div>
         </AnimatePresence>
      </div>

      {/* Desktop Controls */}
      <div className="hidden md:flex absolute inset-0 items-center justify-between px-10 pointer-events-none">
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-12 w-12 rounded-full bg-white/10 text-white hover:bg-white/20 pointer-events-auto disabled:opacity-30" 
          onClick={prev}
          disabled={currentStoryIndex === 0}
        >
          <ChevronLeft className="w-8 h-8" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-12 w-12 rounded-full bg-white/10 text-white hover:bg-white/20 pointer-events-auto" 
          onClick={next}
        >
          <ChevronRight className="w-8 h-8" />
        </Button>
      </div>

      {/* Bottom Controls (Like and Close) */}
      <div className="absolute bottom-0 left-0 right-0 p-6 flex items-center justify-end z-50">
          <div className="flex items-center gap-4">
            <button
               onClick={handleToggleLike}
               className="group flex flex-col items-center gap-1 transition-transform active:scale-90"
            >
               <div className={`p-3 rounded-full backdrop-blur-md transition-colors ${likedStories[currentStory.id] ? 'bg-red-500/20 text-red-500' : 'bg-black/20 text-white hover:bg-black/40'}`}>
                 <Heart className={`w-7 h-7 ${likedStories[currentStory.id] ? 'fill-red-500' : ''}`} />
               </div>
               <span className="text-[10px] font-black text-white drop-shadow-md tracking-tighter uppercase whitespace-nowrap">
                 {likeCounts[currentStory.id] || 0} ta
               </span>
            </button>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full bg-black/20 text-white hover:bg-black/40 backdrop-blur-md h-12 w-12"
              onClick={onClose}
            >
              <X className="w-6 h-6" />
            </Button>
          </div>
        </div>
    </div>
  );
}
