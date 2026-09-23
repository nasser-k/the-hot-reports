"use client";

import LiveAdBanner from "./LiveAdBanner";
import type { LiveAdSlot } from "@/lib/ad-slots";

type ResponsiveAdBannerProps = {
  /** Desktop slot name (e.g., "homepage_banner") */
  desktopSlot: LiveAdSlot;
  /** Mobile slot name (e.g., "homepage_mobile") */
  mobileSlot: LiveAdSlot;
  className?: string;
};

/**
 * Responsive Ad Banner that shows different slots for desktop and mobile
 * Desktop: 728x90 leaderboard
 * Mobile: 320x100 mobile banner
 */
export function ResponsiveAdBanner({
  desktopSlot,
  mobileSlot,
  className = "",
}: ResponsiveAdBannerProps) {
  return (
    <div className={`w-full ${className}`}>
      {/* Desktop ad - hidden on mobile */}
      <div className="hidden sm:block">
        <LiveAdBanner slot={desktopSlot} />
      </div>
      
      {/* Mobile ad - hidden on desktop */}
      <div className="block sm:hidden">
        <LiveAdBanner slot={mobileSlot} />
      </div>
    </div>
  );
}
