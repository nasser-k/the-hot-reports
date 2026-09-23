import { getAd } from "@/lib/ads";
import type { LiveAdSlot } from "@/lib/ad-slots";
import LiveAdBanner from "./LiveAdBanner";

interface LiveAdBannerWrapperProps {
  slot: LiveAdSlot;
  className?: string;
}

/**
 * Server component wrapper that prefetches ad data
 * This prevents ad slots from appearing late on page load
 */
export default async function LiveAdBannerWrapper({
  slot,
  className = "",
}: LiveAdBannerWrapperProps) {
  // Prefetch ad data on the server
  const initialAdData = await getAd(slot).catch(() => ({ ad: null }));

  return <LiveAdBanner slot={slot} className={className} initialAdData={initialAdData} />;
}
