"use client";

import { useEffect } from "react";
import { trackStoryEpisodeView } from "@/lib/api";

export default function TrackStoryView({ slug }: { slug: string }) {
  useEffect(() => {
    // Prevent duplicate tracking in same session (e.g., React StrictMode double-mount)
    const storageKey = `viewed-story-${slug}`;
    if (sessionStorage.getItem(storageKey)) {
      return; // Already tracked this session
    }
    
    trackStoryEpisodeView(slug);
    sessionStorage.setItem(storageKey, Date.now().toString());
  }, [slug]);

  return null;
}
