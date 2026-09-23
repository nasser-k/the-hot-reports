"use client";

interface AdBannerProps {
  size: "leaderboard" | "rectangle" | "banner" | "skyscraper" | "mobile";
  className?: string;
}

const adSizes = {
  leaderboard: { w: 728, h: 90, label: "728×90 Leaderboard" },
  rectangle: { w: 300, h: 250, label: "300×250 Rectangle" },
  banner: { w: 468, h: 60, label: "468×60 Banner" },
  skyscraper: { w: 160, h: 600, label: "160×600 Skyscraper" },
  mobile: { w: 320, h: 100, label: "320×100 Mobile Banner" },
};

export default function AdBanner({ size, className = "" }: AdBannerProps) {
  const ad = adSizes[size];

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 border border-dashed border-gray-200 dark:border-gray-700 rounded-lg flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 w-full"
        style={{ maxWidth: ad.w, aspectRatio: `${ad.w}/${ad.h}` }}
      >
        <span className="text-[10px] font-medium uppercase tracking-wider">
          Advertisement
        </span>
        <span className="text-[10px] mt-0.5">{ad.label}</span>
      </div>
    </div>
  );
}
