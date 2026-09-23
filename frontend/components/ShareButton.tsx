"use client";

import { Share2, Check } from "lucide-react";
import { useState } from "react";

interface ShareButtonProps {
  url: string;
  title: string;
  text?: string;
}

export default function ShareButton({ url, title, text }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    // Try Web Share API first (mobile/native)
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: text || title,
          url,
        });
        return;
      } catch (err) {
        // User cancelled or share failed, fall through to copy
        if ((err as Error).name === "AbortError") return;
      }
    }

    // Fallback: Copy to clipboard
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API not available, open mailto as last resort
      window.open(
        `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`,
        "_blank"
      );
    }
  };

  return (
    <button
      onClick={handleShare}
      className="w-8 h-8 flex items-center justify-center bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-full hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
      aria-label={copied ? "Link copied!" : "Share"}
      title={copied ? "Link copied!" : "Share"}
    >
      {copied ? <Check size={14} className="text-green-600" /> : <Share2 size={14} />}
    </button>
  );
}
