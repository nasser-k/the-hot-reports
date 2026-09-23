"use client";

import { useEffect, useState } from "react";
import LiveAdBanner from "@/components/LiveAdBanner";
import type { LiveAdSlot } from "@/lib/ad-slots";
import type { AdResponse } from "@/lib/ads";

type ViewportMode = "min-lg" | "max-lg";

const QUERIES: Record<ViewportMode, string> = {
  "min-lg": "(min-width: 1024px)",
  "max-lg": "(max-width: 1023px)",
};

interface ViewportLiveAdProps {
  slot: LiveAdSlot;
  showWhen: ViewportMode;
  className?: string;
  minHeight?: number;
  initialAdData?: AdResponse | null;
}

/**
 * Mounts one LiveAdBanner for the active breakpoint only (not two hidden slots).
 */
export default function ViewportLiveAd({
  slot,
  showWhen,
  className = "",
  minHeight = 90,
  initialAdData,
}: ViewportLiveAdProps) {
  const [active, setActive] = useState<boolean | null>(null);

  useEffect(() => {
    const mq = window.matchMedia(QUERIES[showWhen]);
    const update = () => setActive(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [showWhen]);

  if (active === null) {
    return <div className={className} aria-hidden style={{ minHeight }} />;
  }

  if (!active) {
    return null;
  }

  return <LiveAdBanner slot={slot} className={className} initialAdData={initialAdData} />;
}
