"use client";

import { useEffect, useRef } from "react";

interface GoogleAdSenseProps {
  adSlot: string;
  adFormat?: "auto" | "horizontal" | "rectangle" | "vertical";
  className?: string;
  minWidth?: number;
  minHeight?: number;
}

/** True when the slot has layout size and is not CSS-hidden. */
function canFillAd(container: HTMLElement): boolean {
  const style = window.getComputedStyle(container);
  if (style.display === "none" || style.visibility === "hidden") return false;
  const rect = container.getBoundingClientRect();
  return rect.width >= 1 && rect.height >= 1;
}

/**
 * Loads one AdSense unit when visible (IntersectionObserver + ResizeObserver).
 * Client ID: layout.tsx / public/ads.txt (ca-pub-2490742131633018).
 */
export default function GoogleAdSense({
  adSlot,
  adFormat = "auto",
  className = "",
  minWidth = 300,
  minHeight = 90,
}: GoogleAdSenseProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || initialized.current) return;

    const fillAd = () => {
      if (initialized.current || !canFillAd(container)) return;

      try {
        const w = window as Window & { adsbygoogle?: unknown[] };
        w.adsbygoogle = w.adsbygoogle || [];
        w.adsbygoogle.push({});
        initialized.current = true;
      } catch (e) {
        console.error("AdSense error:", e);
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          requestAnimationFrame(fillAd);
        }
      },
      { rootMargin: "50px", threshold: 0 }
    );

    const resizeObserver = new ResizeObserver(() => {
      if (!initialized.current) requestAnimationFrame(fillAd);
    });

    observer.observe(container);
    resizeObserver.observe(container);
    requestAnimationFrame(fillAd);

    return () => {
      observer.disconnect();
      resizeObserver.disconnect();
    };
  }, [adSlot]);

  const useResponsive = adFormat === "auto";

  return (
    <div
      ref={containerRef}
      className={`adsense-slot w-full overflow-hidden ${className}`}
      style={{ minWidth, minHeight }}
    >
      <ins
        className="adsbygoogle block"
        style={{ display: "block", minWidth, minHeight, width: "100%" }}
        data-ad-client="ca-pub-2490742131633018"
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        {...(useResponsive ? { "data-full-width-responsive": "true" } : {})}
      />
    </div>
  );
}
