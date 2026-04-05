"use client";

import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number;
  max?: number;
  size?: number;
  className?: string;
  onRatingChange?: (rating: number) => void;
}

export default function StarRating({ 
  rating, 
  max = 5, 
  size = 20, 
  className = "",
  onRatingChange 
}: StarRatingProps) {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {[...Array(max)].map((_, i) => {
        const starValue = i + 1;
        const isFull = starValue <= Math.floor(rating);
        const isHalf = !isFull && starValue <= Math.ceil(rating);

        return (
          <button
            key={i}
            type="button"
            disabled={!onRatingChange}
            onClick={() => onRatingChange?.(starValue)}
            className={`${onRatingChange ? "cursor-pointer hover:scale-110 transition-transform" : "cursor-default"}`}
          >
            <Star
              size={size}
              className={`${
                isFull 
                  ? "fill-amber-400 text-amber-400" 
                  : isHalf 
                    ? "fill-amber-400/50 text-amber-400" 
                    : "text-gray-300 dark:text-gray-600"
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}
