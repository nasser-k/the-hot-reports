"use client";

import { useEffect } from "react";
import { trackArticleView } from "@/lib/api";

export default function TrackArticleView({ slug }: { slug: string }) {
  useEffect(() => {
    // Prevent duplicate tracking in same session (e.g., React StrictMode double-mount)
    const storageKey = `viewed-article-${slug}`;
    if (sessionStorage.getItem(storageKey)) {
      return; // Already tracked this session
    }
    
    trackArticleView(slug);
    sessionStorage.setItem(storageKey, Date.now().toString());
  }, [slug]);

  return null;
}

