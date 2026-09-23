"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { getAd, trackAdClick, type AdResponse } from "@/lib/ads";
import type { LiveAdSlot } from "@/lib/ad-slots";
import {
  AD_SLOT_DISPLAY,
  getAdsenseUnitId,
  type AdSlotDisplayConfig,
} from "@/lib/ad-slot-config";
import GoogleAdSense from "./GoogleAdSense";

interface LiveAdBannerProps {
  slot: LiveAdSlot;
  className?: string;
  initialAdData?: AdResponse | null;
}

function AdPlaceholder({ config }: { config: Pick<AdSlotDisplayConfig, "label" | "aspectRatio"> }) {
  return (
    <div
      className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 border border-dashed border-gray-200 dark:border-gray-700 rounded-lg flex flex-col items-center justify-center text-gray-400 dark:text-gray-500"
      style={{ aspectRatio: config.aspectRatio }}
    >
      <span className="text-[10px] font-medium uppercase tracking-wider">Advertisement</span>
      <span className="text-[10px] mt-0.5">{config.label}</span>
    </div>
  );
}

function AdSlotFrame({
  config,
  className,
  children,
}: {
  config: AdSlotDisplayConfig;
  className: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`w-full flex items-center justify-center ${className}`}>
      <div
        className="w-full"
        style={{
          maxWidth: config.maxW,
          aspectRatio: config.aspectRatio,
          minHeight: config.minHeight,
        }}
      >
        {children}
      </div>
    </div>
  );
}

function AdSenseFallback({
  slot,
  config,
  className,
}: {
  slot: LiveAdSlot;
  config: AdSlotDisplayConfig;
  className: string;
}) {
  const unitId = getAdsenseUnitId(slot);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // During SSR and initial hydration, show placeholder to avoid hydration mismatch
  if (!unitId || !mounted) {
    return (
      <AdSlotFrame config={config} className={className}>
        <AdPlaceholder config={config} />
      </AdSlotFrame>
    );
  }

  return (
    <div className={`w-full flex items-center justify-center ${className}`}>
      <div className="w-full" style={{ maxWidth: config.maxW }}>
        <GoogleAdSense
          adSlot={unitId}
          adFormat={config.adsenseFormat}
          minWidth={config.minWidth}
          minHeight={config.minHeight}
        />
      </div>
    </div>
  );
}

export default function LiveAdBanner({ slot, className = "", initialAdData }: LiveAdBannerProps) {
  const [adData, setAdData] = useState<AdResponse | null>(initialAdData ?? null);
  const [isLoading, setIsLoading] = useState(!initialAdData);

  const config = AD_SLOT_DISPLAY[slot];

  useEffect(() => {
    // Skip fetch if we have initial data - only re-fetch on client-side navigation
    if (initialAdData) return;

    let cancelled = false;

    const load = async () => {
      const response = await getAd(slot, {
        page: typeof window !== "undefined" ? window.location.pathname : undefined,
      });
      if (!cancelled) {
        setAdData(response);
        setIsLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [slot, initialAdData]);

  const handleClick = useCallback(
    () => {
      if (!adData?.ad?.id) return;

      // Track click before navigation (fire-and-forget)
      trackAdClick(adData.ad.id, {
        page: window.location.pathname,
      });

      // Let anchor tag handle navigation naturally with target="_blank"
      // No e.preventDefault() - allows normal secure navigation without CSP issues
    },
    [adData]
  );

  if (isLoading) {
    return (
      <AdSlotFrame config={config} className={className}>
        <AdPlaceholder config={config} />
      </AdSlotFrame>
    );
  }

  if (!adData?.ad) {
    return <AdSenseFallback slot={slot} config={config} className={className} />;
  }

  const ad = adData.ad;

  return (
    <div className={`w-full flex items-center justify-center ${className}`}>
      <a
        href={ad.linkUrl || "#"}
        onClick={handleClick}
        target="_blank"
        rel="noopener noreferrer"
        className="block relative w-full overflow-hidden rounded-lg hover:opacity-95 transition-opacity"
        style={{
          maxWidth: config.maxW,
          aspectRatio: config.aspectRatio,
          minHeight: config.minHeight,
        }}
        aria-label={ad.altText || "Advertisement"}
      >
        {ad.imageUrl ? (
          <Image
            src={ad.imageUrl}
            alt={ad.altText || "Advertisement"}
            fill
            className="object-contain"
            sizes={`(max-width: 768px) 100vw, ${config.maxW}`}
            loading="eager"
            priority
          />
        ) : (
          <AdPlaceholder config={config} />
        )}

        {!ad.isHouseAd && (
          <span className="absolute top-1 right-1 px-1.5 py-0.5 bg-black/60 text-white text-[9px] font-medium rounded">
            AD
          </span>
        )}
      </a>
    </div>
  );
}
