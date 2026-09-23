from django.db import models
from django.utils.text import slugify
from pulse.fields import ProcessedImageField
from pulse.media_storage import tourism_image_path


class TourismListing(models.Model):
    TYPE_SAFARI = "safari"
    TYPE_LODGE = "lodge"
    TYPE_HOTEL = "hotel"
    TYPE_CAMPSITE = "campsite"
    TYPE_EXPERIENCE = "experience"
    TYPE_CHOICES = [
        (TYPE_SAFARI, "Safari"),
        (TYPE_LODGE, "Lodge"),
        (TYPE_HOTEL, "Hotel"),
        (TYPE_CAMPSITE, "Campsite"),
        (TYPE_EXPERIENCE, "Experience"),
    ]

    slug = models.SlugField(max_length=200, unique=True, blank=True)
    name = models.CharField(max_length=300)
    listing_type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    tagline = models.CharField(max_length=500)
    description = models.TextField()
    image_url = models.URLField(max_length=500, blank=True)
    image_attribution = models.CharField(
        max_length=500,
        blank=True,
        help_text="e.g., 'Tony Webster from Minneapolis, Minnesota, United States, CC BY 2.0, via Wikimedia Commons'"
    )
    image = ProcessedImageField(
        upload_to=tourism_image_path,
        max_size=(800, 600),
        blank=True,
        null=True,
        help_text="Upload a tourism listing image. Will be automatically resized to max 800x600 and converted to WebP format. Saved as: tourism-images/YYYY/MM/slugified-name.webp"
    )
    location = models.CharField(max_length=200)
    price_range = models.CharField(max_length=120)
    rating = models.DecimalField(max_digits=3, decimal_places=1)
    featured = models.BooleanField(default=False, db_index=True)
    website = models.URLField(max_length=500, blank=True)
    phone = models.CharField(max_length=80, blank=True)
    tags = models.JSONField(default=list)

    created_by = models.ForeignKey(
        "accounts.User",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="tourism_listings",
    )

    # SEO fields
    meta_title = models.CharField(max_length=500, blank=True, help_text="Custom title for SEO/social (falls back to listing name)")
    meta_description = models.TextField(blank=True, help_text="Custom description for SEO/social (falls back to tagline)")
    meta_keywords = models.CharField(max_length=500, blank=True, help_text="Comma-separated keywords for SEO (e.g., 'safari, lodge, Kigezi')")

    class Meta:
        ordering = ("name",)

    def __str__(self) -> str:
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
            # Ensure uniqueness
            original_slug = self.slug
            counter = 1
            while TourismListing.objects.filter(slug=self.slug).exclude(pk=self.pk).exists():
                self.slug = f"{original_slug}-{counter}"
                counter += 1
        super().save(*args, **kwargs)
