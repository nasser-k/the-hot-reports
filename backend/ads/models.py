"""
Advertising models.

Slots: backend/ads/slots.py → `python manage.py setup_ad_slots`
Serve: GET /api/v1/ads/serve/<slot_key>/  (paid → house → null)
Click: POST /api/v1/ads/click/<ad_id>/
Frontend: LiveAdBanner → lib/ads.ts → AdSense fallback per slot
"""
import os
from datetime import datetime

from django.db import models
from django.utils import timezone
from django.utils.text import slugify
from pulse.fields import ProcessedImageField


def ad_image_path(instance, filename: str) -> str:
    """Generate path for ad images: ads/YYYY/MM/slugified-name.webp"""
    now = datetime.now()
    year = now.strftime("%Y")
    month = now.strftime("%m")
    # Use ad name or client+name combo
    name = f"{instance.client_name}-{instance.name}" if instance.client_name else instance.name
    slug = slugify(name)[:100]
    ext = os.path.splitext(filename)[1].lower() or ".webp"
    return f"ads/{year}/{month}/{slug}{ext}"


class AdSlot(models.Model):
    """Fixed placement on the site; slot_key matches frontend LiveAdSlot."""

    slot_key = models.SlugField(max_length=50, unique=True, db_index=True)
    name = models.CharField(max_length=100, help_text="Admin display name")
    is_active = models.BooleanField(default=True, db_index=True)

    class Meta:
        verbose_name = "Ad Slot"
        verbose_name_plural = "Ad Slots"
        ordering = ("slot_key",)

    def __str__(self) -> str:
        return f"{self.name} ({self.slot_key})"


class Ad(models.Model):
    """Paid or house creative assigned to one slot and date range."""

    name = models.CharField(max_length=200, help_text="Internal name")
    client_name = models.CharField(max_length=200, blank=True, help_text="Advertiser name")

    image = ProcessedImageField(
        upload_to=ad_image_path,
        max_size=(728, 250),
        blank=True,
        null=True,
        help_text="IMPORTANT: Upload images at EXACT dimensions for best results: Leaderboard 728×90px, Mobile 320×100px, Sidebar 300×250px. Images maintain aspect ratio - wrong sizes will show with black bars.",
    )
    link_url = models.URLField(max_length=1000, blank=True)
    alt_text = models.CharField(max_length=200, blank=True)

    slot = models.ForeignKey(AdSlot, on_delete=models.PROTECT, related_name="ads")
    start_date = models.DateField()
    end_date = models.DateField()

    is_active = models.BooleanField(default=True, db_index=True)
    is_house_ad = models.BooleanField(
        default=False,
        db_index=True,
        help_text="Shown when no paid ad is available for this slot",
    )
    priority = models.PositiveSmallIntegerField(
        default=5,
        help_text="Higher number = higher priority. Examples: 10=Premium clients, 5=Standard ads, 1=House ads. When multiple ads are active in the same slot, the highest priority wins. Ties are broken randomly.",
    )

    impressions = models.PositiveIntegerField(default=0)
    clicks = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Advertisement"
        verbose_name_plural = "Advertisements"
        ordering = ("-priority", "-created_at")

    def __str__(self) -> str:
        return f"{self.name} ({self.client_name or 'House'})"

    def is_running(self) -> bool:
        today = timezone.now().date()
        return self.is_active and self.start_date <= today <= self.end_date

    @property
    def ctr(self) -> float:
        if self.impressions == 0:
            return 0.0
        return round((self.clicks / self.impressions) * 100, 2)


class AdEvent(models.Model):
    """Impression and click log (deduped impressions per IP per ad per day in views)."""

    EVENT_IMPRESSION = "impression"
    EVENT_CLICK = "click"
    EVENT_CHOICES = [
        (EVENT_IMPRESSION, "Impression"),
        (EVENT_CLICK, "Click"),
    ]

    ad = models.ForeignKey(Ad, on_delete=models.CASCADE, related_name="events")
    event_type = models.CharField(max_length=20, choices=EVENT_CHOICES, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.CharField(max_length=200, blank=True)
    page_path = models.CharField(max_length=200, blank=True)

    class Meta:
        verbose_name = "Ad Event"
        verbose_name_plural = "Ad Events"
        ordering = ("-created_at",)
        indexes = [
            models.Index(fields=["ad", "event_type", "created_at"]),
        ]
