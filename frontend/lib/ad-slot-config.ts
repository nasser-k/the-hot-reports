import type { LiveAdSlot } from "@/lib/ad-slots";
import { LIVE_AD_SLOT_KEYS } from "@/lib/ad-slots";

export type AdDisplayFormat = "horizontal" | "rectangle";

export interface AdSlotDisplayConfig {
  aspectRatio: string;
  maxW: string;
  label: string;
  adsenseFormat: AdDisplayFormat;
  minWidth: number;
  minHeight: number;
}

/** Maps slot_key → NEXT_PUBLIC_ADSENSE_<SLOT_KEY_UPPER> (matches .env.example). */
export function adsenseEnvVarName(slotKey: LiveAdSlot): string {
  return `NEXT_PUBLIC_ADSENSE_${slotKey.toUpperCase()}`;
}

export function getAdsenseUnitId(slotKey: LiveAdSlot): string {
  const envName = adsenseEnvVarName(slotKey);
  return (process.env[envName] ?? "").trim();
}

export const AD_SLOT_DISPLAY: Record<LiveAdSlot, AdSlotDisplayConfig> = {
  homepage_banner: {
    aspectRatio: "728/90",
    maxW: "728px",
    label: "728×90 Leaderboard",
    adsenseFormat: "horizontal",
    minWidth: 728,
    minHeight: 90,
  },
  homepage_mobile: {
    aspectRatio: "320/100",
    maxW: "320px",
    label: "320×100 Mobile Banner",
    adsenseFormat: "horizontal",
    minWidth: 320,
    minHeight: 100,
  },
  homepage_sidebar: {
    aspectRatio: "300/250",
    maxW: "300px",
    label: "300×250 MPU",
    adsenseFormat: "rectangle",
    minWidth: 300,
    minHeight: 250,
  },
  article_top: {
    aspectRatio: "728/90",
    maxW: "728px",
    label: "728×90 Article Top",
    adsenseFormat: "horizontal",
    minWidth: 728,
    minHeight: 90,
  },
  article_top_mobile: {
    aspectRatio: "320/100",
    maxW: "320px",
    label: "320×100 Article Top Mobile",
    adsenseFormat: "horizontal",
    minWidth: 320,
    minHeight: 100,
  },
  article_bottom: {
    aspectRatio: "728/90",
    maxW: "728px",
    label: "728×90 Article Bottom",
    adsenseFormat: "horizontal",
    minWidth: 728,
    minHeight: 90,
  },
  article_bottom_mobile: {
    aspectRatio: "320/100",
    maxW: "320px",
    label: "320×100 Article Bottom Mobile",
    adsenseFormat: "horizontal",
    minWidth: 320,
    minHeight: 100,
  },
  article_sidebar: {
    aspectRatio: "300/250",
    maxW: "300px",
    label: "300×250 Article Side",
    adsenseFormat: "rectangle",
    minWidth: 300,
    minHeight: 250,
  },
  category_top: {
    aspectRatio: "728/90",
    maxW: "728px",
    label: "728×90 Category Top",
    adsenseFormat: "horizontal",
    minWidth: 728,
    minHeight: 90,
  },
  category_top_mobile: {
    aspectRatio: "320/100",
    maxW: "320px",
    label: "320×100 Category Top Mobile",
    adsenseFormat: "horizontal",
    minWidth: 320,
    minHeight: 100,
  },
  category_sidebar: {
    aspectRatio: "300/250",
    maxW: "300px",
    label: "300×250 Category",
    adsenseFormat: "rectangle",
    minWidth: 300,
    minHeight: 250,
  },
  stories_top: {
    aspectRatio: "728/90",
    maxW: "728px",
    label: "728×90 Stories Top",
    adsenseFormat: "horizontal",
    minWidth: 728,
    minHeight: 90,
  },
  stories_top_mobile: {
    aspectRatio: "320/100",
    maxW: "320px",
    label: "320×100 Stories Top Mobile",
    adsenseFormat: "horizontal",
    minWidth: 320,
    minHeight: 100,
  },
  stories_mid: {
    aspectRatio: "728/90",
    maxW: "728px",
    label: "728×90 Stories Mid",
    adsenseFormat: "horizontal",
    minWidth: 728,
    minHeight: 90,
  },
  stories_mid_mobile: {
    aspectRatio: "320/100",
    maxW: "320px",
    label: "320×100 Stories Mid Mobile",
    adsenseFormat: "horizontal",
    minWidth: 320,
    minHeight: 100,
  },
  story_top: {
    aspectRatio: "728/90",
    maxW: "728px",
    label: "728×90 Story Top",
    adsenseFormat: "horizontal",
    minWidth: 728,
    minHeight: 90,
  },
  story_top_mobile: {
    aspectRatio: "320/100",
    maxW: "320px",
    label: "320×100 Story Top Mobile",
    adsenseFormat: "horizontal",
    minWidth: 320,
    minHeight: 100,
  },
  story_mid: {
    aspectRatio: "728/90",
    maxW: "728px",
    label: "728×90 Story Mid",
    adsenseFormat: "horizontal",
    minWidth: 728,
    minHeight: 90,
  },
  story_mid_mobile: {
    aspectRatio: "320/100",
    maxW: "320px",
    label: "320×100 Story Mid Mobile",
    adsenseFormat: "horizontal",
    minWidth: 320,
    minHeight: 100,
  },
  episode_top: {
    aspectRatio: "728/90",
    maxW: "728px",
    label: "728×90 Episode Top",
    adsenseFormat: "horizontal",
    minWidth: 728,
    minHeight: 90,
  },
  episode_top_mobile: {
    aspectRatio: "320/100",
    maxW: "320px",
    label: "320×100 Episode Top Mobile",
    adsenseFormat: "horizontal",
    minWidth: 320,
    minHeight: 100,
  },
  episode_mid: {
    aspectRatio: "728/90",
    maxW: "728px",
    label: "728×90 Episode Mid",
    adsenseFormat: "horizontal",
    minWidth: 728,
    minHeight: 90,
  },
  episode_mid_mobile: {
    aspectRatio: "320/100",
    maxW: "320px",
    label: "320×100 Episode Mid Mobile",
    adsenseFormat: "horizontal",
    minWidth: 320,
    minHeight: 100,
  },
  tourism_top: {
    aspectRatio: "728/90",
    maxW: "728px",
    label: "728×90 Tourism Top",
    adsenseFormat: "horizontal",
    minWidth: 728,
    minHeight: 90,
  },
  tourism_top_mobile: {
    aspectRatio: "320/100",
    maxW: "320px",
    label: "320×100 Tourism Top Mobile",
    adsenseFormat: "horizontal",
    minWidth: 320,
    minHeight: 100,
  },
  tourism_sidebar: {
    aspectRatio: "300/250",
    maxW: "300px",
    label: "300×250 Tourism",
    adsenseFormat: "rectangle",
    minWidth: 300,
    minHeight: 250,
  },
  tourism_banner: {
    aspectRatio: "728/90",
    maxW: "728px",
    label: "728×90 Tourism Banner",
    adsenseFormat: "horizontal",
    minWidth: 728,
    minHeight: 90,
  },
  tourism_banner_mobile: {
    aspectRatio: "320/100",
    maxW: "320px",
    label: "320×100 Tourism Banner Mobile",
    adsenseFormat: "horizontal",
    minWidth: 320,
    minHeight: 100,
  },
} satisfies Record<LiveAdSlot, AdSlotDisplayConfig>;

// Keep keys aligned with backend/ads/slots.py
void LIVE_AD_SLOT_KEYS;
