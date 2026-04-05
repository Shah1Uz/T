"use client";

import { useState, useMemo, useEffect } from "react";
import StoryViewer from "./story-viewer";

interface StoriesBarProps {
  stories: any[];
}

export default function StoriesBar({ stories }: StoriesBarProps) {
  const [selectedUserStories, setSelectedUserStories] = useState<any[] | null>(null);
  const [viewedStoryIds, setViewedStoryIds] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  // Load viewed stories from localStorage safely
  useEffect(() => {
    setMounted(true);
    const viewedStr = localStorage.getItem("viewed_stories") || "[]";
    setViewedStoryIds(JSON.parse(viewedStr));
  }, []);

  // Group stories by userId
  const groupedStories = useMemo(() => {
    const groups: Record<string, any[]> = {};
    
    stories.forEach(story => {
      const userId = story.userId;
      if (!groups[userId]) {
        groups[userId] = [];
      }
      groups[userId].push(story);
    });

    return Object.values(groups).sort((a, b) => {
      const aTime = new Date(a[a.length - 1].createdAt).getTime();
      const bTime = new Date(b[b.length - 1].createdAt).getTime();
      return bTime - aTime;
    });
  }, [stories]);

  const handleStoryViewed = (id: string) => {
    if (!viewedStoryIds.includes(id)) {
      setViewedStoryIds(prev => [...prev, id]);
    }
  };

  if (stories.length === 0) return null;

  if (!mounted) {
    return (
      <div className="container px-4 pt-8 pb-2">
        <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex flex-col items-center gap-2 shrink-0 animate-pulse">
              <div className="h-16 w-16 md:h-20 md:w-20 rounded-full bg-muted" />
              <div className="h-2 w-12 bg-muted rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container px-4 pt-8 pb-2">
      <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
        {groupedStories.map((userStories) => {
          const latestStory = userStories[userStories.length - 1];
          const user = latestStory.user;
          
          const hasUnseen = userStories.some(s => !viewedStoryIds.includes(s.id));
          
          return (
            <button
              key={user.id}
              onClick={() => setSelectedUserStories(userStories)}
              className="flex flex-col items-center gap-2 group shrink-0"
            >
              <div className={`p-[3px] rounded-full transition-all duration-500 group-hover:scale-105 ${hasUnseen ? "bg-primary shadow-lg shadow-primary/20" : "bg-muted-foreground/30"}`}>
                <div className="p-[2px] rounded-full bg-background dark:bg-slate-950">
                  <div className="h-16 w-16 md:h-20 md:w-20 rounded-full overflow-hidden border border-border/50">
                    <img 
                      src={user.imageUrl || "/default-avatar.png"} 
                      alt={user.name} 
                      className={`w-full h-full object-cover transition-all duration-500 ${!hasUnseen ? "grayscale-[0.5] opacity-70" : ""}`}
                    />
                  </div>
                </div>
              </div>
              <span className={`text-[11px] font-black truncate max-w-[80px] uppercase tracking-tighter transition-colors ${hasUnseen ? "text-foreground" : "text-muted-foreground"}`}>
                {user.name || "Admin"}
              </span>
            </button>
          );
        })}
      </div>

      {selectedUserStories && (
        <StoryViewer 
          stories={selectedUserStories} 
          initialIndex={0} 
          onClose={() => setSelectedUserStories(null)} 
          onStoryViewed={handleStoryViewed}
        />
      )}
    </div>
  );
}
