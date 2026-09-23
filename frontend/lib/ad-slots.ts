/**
 * Ad slot keys — must match backend/ads/slots.py (AD_SLOT_DEFINITIONS).
 * Run once: python manage.py setup_ad_slots
 */
export const LIVE_AD_SLOT_KEYS = [
  "homepage_banner",
  "homepage_mobile",
  "homepage_sidebar",
  "article_top",
  "article_top_mobile",
  "article_bottom",
  "article_bottom_mobile",
  "article_sidebar",
  "category_top",
  "category_top_mobile",
  "category_sidebar",
  "stories_top",
  "stories_top_mobile",
  "stories_mid",
  "stories_mid_mobile",
  "story_top",
  "story_top_mobile",
  "story_mid",
  "story_mid_mobile",
  "episode_top",
  "episode_top_mobile",
  "episode_mid",
  "episode_mid_mobile",
  "tourism_top",
  "tourism_top_mobile",
  "tourism_sidebar",
  "tourism_banner",
  "tourism_banner_mobile",
] as const;

export type LiveAdSlot = (typeof LIVE_AD_SLOT_KEYS)[number];

export function isLiveAdSlot(value: string): value is LiveAdSlot {
  return (LIVE_AD_SLOT_KEYS as readonly string[]).includes(value);
}
