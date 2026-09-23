"""
Canonical ad slot registry for The Hot Reports.

Keep in sync with:
  - frontend/lib/ad-slots.ts (LIVE_AD_SLOT_KEYS)
  - frontend/lib/ad-slot-config.ts (display + AdSense env mapping)

Flow:
  1. python manage.py setup_ad_slots  → creates AdSlot rows
  2. Django Admin → create Ad (paid or house) per slot + date range
  3. Frontend LiveAdBanner → GET /api/v1/ads/serve/<slot_key>/
  4. No paid/house ad → Google AdSense (NEXT_PUBLIC_ADSENSE_<SLOT_KEY_UPPER>)
"""

from typing import NamedTuple


class AdSlotDefinition(NamedTuple):
    slot_key: str
    name: str


# Order matches frontend LIVE_AD_SLOT_KEYS
AD_SLOT_DEFINITIONS: tuple[AdSlotDefinition, ...] = (
    AdSlotDefinition("homepage_banner", "Homepage Top Banner (728×90)"),
    AdSlotDefinition("homepage_mobile", "Homepage Mobile Banner (320×100)"),
    AdSlotDefinition("homepage_sidebar", "Homepage Sidebar (300×250)"),
    AdSlotDefinition("article_top", "Article Top Banner (728×90)"),
    AdSlotDefinition("article_top_mobile", "Article Top Mobile (320×100)"),
    AdSlotDefinition("article_bottom", "Article Bottom (728×90)"),
    AdSlotDefinition("article_bottom_mobile", "Article Bottom Mobile (320×100)"),
    AdSlotDefinition("article_sidebar", "Article Sidebar (300×250)"),
    AdSlotDefinition("category_top", "Category Top Banner (728×90)"),
    AdSlotDefinition("category_top_mobile", "Category Top Mobile (320×100)"),
    AdSlotDefinition("category_sidebar", "Category Sidebar (300×250)"),
    AdSlotDefinition("stories_top", "Stories Listing Top (728×90)"),
    AdSlotDefinition("stories_top_mobile", "Stories Listing Mobile (320×100)"),
    AdSlotDefinition("stories_mid", "Stories Listing Mid-Content (728×90)"),
    AdSlotDefinition("stories_mid_mobile", "Stories Mid Mobile (320×100)"),
    AdSlotDefinition("story_top", "Story Series Top (728×90)"),
    AdSlotDefinition("story_top_mobile", "Story Series Mobile (320×100)"),
    AdSlotDefinition("story_mid", "Story Series Mid-Content (728×90)"),
    AdSlotDefinition("story_mid_mobile", "Story Mid Mobile (320×100)"),
    AdSlotDefinition("episode_top", "Episode Top (728×90)"),
    AdSlotDefinition("episode_top_mobile", "Episode Mobile (320×100)"),
    AdSlotDefinition("episode_mid", "Episode Mid-Content (728×90)"),
    AdSlotDefinition("episode_mid_mobile", "Episode Mid Mobile (320×100)"),
    AdSlotDefinition("tourism_top", "Tourism Top Banner (728×90)"),
    AdSlotDefinition("tourism_top_mobile", "Tourism Mobile (320×100)"),
    AdSlotDefinition("tourism_sidebar", "Tourism Sidebar (300×250)"),
    AdSlotDefinition("tourism_banner", "Tourism Banner (728×90)"),
    AdSlotDefinition("tourism_banner_mobile", "Tourism Banner Mobile (320×100)"),
)

AD_SLOT_KEYS: frozenset[str] = frozenset(d.slot_key for d in AD_SLOT_DEFINITIONS)
