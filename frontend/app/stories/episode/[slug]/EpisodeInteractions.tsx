"use client";

import { useState, useEffect } from "react";
import { Heart, MessageCircle } from "lucide-react";
import { getApiErrorMessage, likeStoryEpisode } from "@/lib/api";

interface EpisodeInteractionsProps {
  episodeSlug: string;
  initialLiked: boolean;
  initialLikesCount: number;
  initialCommentsCount: number;
  onCommentClick?: () => void;
}

function likeStorageKey(slug: string) {
  return `liked_episode_${slug}`;
}

export default function EpisodeInteractions({
  episodeSlug,
  initialLiked,
  initialLikesCount,
  initialCommentsCount,
  onCommentClick,
}: EpisodeInteractionsProps) {
  // Prefer localStorage over SSR-derived initialLiked (SSR can't know visitor's client-side ID)
  const [liked, setLiked] = useState(initialLiked);
  const [likesCount, setLikesCount] = useState(initialLikesCount);
  const [commentsCount, setCommentsCount] = useState(initialCommentsCount);
  const [likeLoading, setLikeLoading] = useState(false);

  // On mount, read liked state from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(likeStorageKey(episodeSlug));
    if (stored !== null) {
      setLiked(stored === "true");
    }
  }, [episodeSlug]);

  const handleLike = async () => {
    if (likeLoading) return;
    setLikeLoading(true);
    // Optimistic update
    const newLiked = !liked;
    setLiked(newLiked);
    setLikesCount((c) => c + (newLiked ? 1 : -1));
    try {
      const result = await likeStoryEpisode(episodeSlug);
      setLiked(result.liked);
      setLikesCount(result.likesCount);
      localStorage.setItem(likeStorageKey(episodeSlug), String(result.liked));
    } catch (err) {
      setLiked(liked);
      setLikesCount((c) => c + (newLiked ? -1 : 1));
      console.error("Failed to like episode:", getApiErrorMessage(err, "Like failed"));
    } finally {
      setLikeLoading(false);
    }
  };

  return (
    <>
      {/* Like Button */}
      <button
        onClick={handleLike}
        disabled={likeLoading}
        className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold transition-all ${
          liked
            ? "bg-pink-500 text-white shadow-lg shadow-pink-500/30"
            : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-pink-500 hover:text-white hover:shadow-lg hover:shadow-pink-500/30"
        }`}
      >
        <Heart className={`w-5 h-5 ${liked ? "fill-current" : ""}`} />
        <span>{likesCount}</span>
      </button>

      {/* Comment Button */}
      <button
        onClick={onCommentClick}
        className="flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-red-500 hover:text-white hover:shadow-lg hover:shadow-red-500/30 transition-all"
      >
        <MessageCircle className="w-5 h-5" />
        <span>{commentsCount}</span>
      </button>
    </>
  );
}
