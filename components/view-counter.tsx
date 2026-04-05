"use client";

import { useEffect, useState } from "react";
import { Eye } from "lucide-react";
import { PusherClient } from "@/lib/pusher-client";

interface ViewCounterProps {
  listingId: string;
  initialCount?: number;
}

export default function ViewCounter({ listingId, initialCount = 0 }: ViewCounterProps) {
  const [count, setCount] = useState(initialCount);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    // Record this view and get updated count
    fetch(`/api/listings/${listingId}/views`, { method: "POST" })
      .then((r) => r.json())
      .then((d) => { if (d.count) setCount(d.count); });

    // Subscribe to real-time view updates
    const channel = PusherClient.subscribe(`listing-${listingId}`);
    channel.bind("view-update", (data: { count: number }) => {
      setCount(data.count);
      // Trigger pulse animation
      setPulse(true);
      setTimeout(() => setPulse(false), 600);
    });

    return () => {
      PusherClient.unsubscribe(`listing-${listingId}`);
    };
  }, [listingId]);

  return (
    <div className={`flex items-center gap-1.5 text-sm font-semibold text-muted-foreground transition-all duration-300 ${pulse ? "text-primary scale-110" : ""}`}>
      <Eye className={`h-4 w-4 ${pulse ? "text-primary" : ""}`} />
      <span>{count.toLocaleString("en-US")}</span>
    </div>
  );
}
