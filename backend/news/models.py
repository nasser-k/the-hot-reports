from django.db import models
from django.utils.text import slugify
from pulse.fields import ProcessedImageField
from pulse.media_storage import article_image_path, episode_image_path, story_cover_path


class Category(models.Model):
    name = models.CharField(max_length=120, unique=True)
    slug = models.SlugField(max_length=140, unique=True, blank=True)
    color = models.CharField(max_length=20)
    order = models.PositiveIntegerField(default=0, db_index=True)

    class Meta:
        ordering = ("order", "name")
        verbose_name_plural = "categories"

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
            # Ensure uniqueness
            original_slug = self.slug
            counter = 1
            while Category.objects.filter(slug=self.slug).exclude(pk=self.pk).exists():
                self.slug = f"{original_slug}-{counter}"
                counter += 1
        super().save(*args, **kwargs)

    def __str__(self) -> str:
        return self.name


class Tag(models.Model):
    name = models.CharField(max_length=120, unique=True)
    slug = models.SlugField(max_length=140, unique=True, blank=True)

    class Meta:
        ordering = ("name",)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)[:140]
        super().save(*args, **kwargs)

    def __str__(self) -> str:
        return self.name


class Article(models.Model):
    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        PENDING = "pending", "Pending review"
        PUBLISHED = "published", "Published"
        REJECTED = "rejected", "Rejected"
    
    class Highlight(models.TextChoices):
        NONE = "", "None"
        FEATURED = "featured", "Featured"
        BREAKING = "breaking", "Breaking News"
        TRENDING = "trending", "Trending"

    slug = models.SlugField(max_length=240, unique=True, blank=True)
    title = models.CharField(max_length=500)
    excerpt = models.TextField()
    content = models.TextField(blank=True)
    category = models.ForeignKey(Category, on_delete=models.PROTECT, related_name="articles")
    author = models.ForeignKey("accounts.User", on_delete=models.PROTECT, related_name="authored_articles")
    image_url = models.URLField(max_length=500, blank=True)
    image_attribution = models.CharField(
        max_length=500,
        blank=True,
        help_text="e.g., 'Tony Webster from Minneapolis, Minnesota, United States, CC BY 2.0, via Wikimedia Commons'"
    )
    image = ProcessedImageField(
        upload_to=article_image_path,
        max_size=(1200, 630),
        blank=True,
        null=True,
        help_text="Upload an article image. Will be automatically resized to max 1200x630 and converted to WebP format. Saved as: article-images/YYYY/MM/slugified-title.webp"
    )
    published_at = models.DateTimeField(null=True, blank=True, db_index=True)
    views_total = models.PositiveIntegerField(default=0, db_index=True)
    scheduled_publish_at = models.DateTimeField(null=True, blank=True, db_index=True)
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.DRAFT, db_index=True)
    approved_by = models.ForeignKey(
        "accounts.User",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="approved_articles",
    )
    approved_at = models.DateTimeField(null=True, blank=True)
    created_by = models.ForeignKey(
        "accounts.User",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="created_articles",
    )
    read_time = models.PositiveSmallIntegerField()
    highlight = models.CharField(
        max_length=20,
        choices=Highlight.choices,
        default=Highlight.NONE,
        blank=True,
        db_index=True,
        help_text="Article can be featured, breaking, trending, or none"
    )
    tags = models.ManyToManyField(Tag, blank=True, related_name="articles")

    # SEO fields
    meta_title = models.CharField(max_length=500, blank=True, help_text="Custom title for SEO/social (falls back to article title)")
    meta_description = models.TextField(blank=True, help_text="Custom description for SEO/social (falls back to excerpt)")
    meta_keywords = models.CharField(max_length=500, blank=True, help_text="Comma-separated keywords for SEO (e.g., 'news, politics, Uganda')")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("-published_at",)
        permissions = [
            ("can_publish_article", "Can publish articles"),
        ]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)[:240]
            # Ensure uniqueness
            original_slug = self.slug
            counter = 1
            while Article.objects.filter(slug=self.slug).exclude(pk=self.pk).exists():
                suffix = f"-{counter}"
                max_length = 240 - len(suffix)
                self.slug = f"{original_slug[:max_length]}{suffix}"
                counter += 1
        super().save(*args, **kwargs)

    def __str__(self) -> str:
        return self.title


class ArticleViewEvent(models.Model):
    article = models.ForeignKey(Article, on_delete=models.CASCADE, related_name="view_events")
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    visitor_key = models.CharField(max_length=64, db_index=True, blank=True, default="")
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.CharField(max_length=400, blank=True)

    class Meta:
        ordering = ("-created_at",)

    def __str__(self) -> str:
        return f"View({self.article_id}) @ {self.created_at.isoformat()}"


class ArticleVisitorDay(models.Model):
    """One row per (article, visitor_key, calendar day) for unique daily view counts."""

    article = models.ForeignKey(Article, on_delete=models.CASCADE, related_name="visitor_days")
    visitor_key = models.CharField(max_length=64, db_index=True)
    day = models.DateField(db_index=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)  # For cache-clear protection
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=("article", "visitor_key", "day"),
                name="news_articlevisitorday_article_visitor_day_uniq",
            )
        ]
        indexes = [
            models.Index(fields=["article", "day", "ip_address"]),
        ]
        ordering = ("-day", "-created_at")

    def __str__(self) -> str:
        return f"{self.article_id} {self.day} {self.visitor_key[:12]}…"


class NewsletterSubscriber(models.Model):
    email = models.EmailField(unique=True, db_index=True)
    confirmed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ("-created_at",)

    def __str__(self) -> str:
        return self.email


class ContactMessage(models.Model):
    SUBJECT_CHOICES = [
        ("news-tip", "News Tip"),
        ("story-submission", "Submit Your Story"),
        ("story-feedback", "Story Feedback"),
        ("tourism-listing", "List Your Tourism Business"),
        ("advertising", "Advertising Inquiry"),
        ("correction", "Correction / Fact Check"),
        ("general", "General Inquiry"),
    ]

    name = models.CharField(max_length=200)
    email = models.EmailField()
    subject = models.CharField(max_length=32, choices=SUBJECT_CHOICES)
    phone = models.CharField(max_length=80, blank=True)
    message = models.TextField()
    handled = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ("-created_at",)

    def __str__(self) -> str:
        return f"{self.subject} from {self.email}"


class PushSubscription(models.Model):
    """Stores browser push notification subscriptions."""

    endpoint = models.URLField(max_length=500, unique=True, db_index=True)
    p256dh = models.CharField(max_length=300)  # Public key
    auth = models.CharField(max_length=200)  # Auth secret
    user_agent = models.TextField(blank=True)
    subscribed_at = models.DateTimeField(auto_now_add=True)
    last_used = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True, db_index=True)
    notification_count = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ("-subscribed_at",)

    def __str__(self) -> str:
        return f"Push({self.endpoint[:50]}...)"

    def to_webpush_format(self):
        """Convert to format expected by pywebpush."""
        return {
            "endpoint": self.endpoint,
            "keys": {
                "p256dh": self.p256dh,
                "auth": self.auth,
            },
        }


class StorySeries(models.Model):
    """A serial story with multiple episodes."""

    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        ONGOING = "ongoing", "Ongoing"
        COMPLETED = "completed", "Completed"

    class Genre(models.TextChoices):
        VILLAGE_DRAMA = "village_drama", "Village Drama"
        CAMPUS_LIFE = "campus_life", "Campus Life"
        FAMILY = "family", "Family Conflict"
        CULTURAL = "cultural", "Cultural Stories"
        TRUE_LIFE = "true_life", "True Life"
        CRIME = "crime", "Crime Mystery"
        INSPIRATIONAL = "inspirational", "Inspirational"

    slug = models.SlugField(max_length=240, unique=True, blank=True)
    title = models.CharField(max_length=300)
    subtitle = models.CharField(max_length=500, blank=True, help_text="Tagline for the story series")
    description = models.TextField(help_text="Brief summary of the story")
    author = models.ForeignKey("accounts.User", on_delete=models.PROTECT, related_name="story_series")
    genre = models.CharField(max_length=20, choices=Genre.choices, default=Genre.VILLAGE_DRAMA)
    cover_image = ProcessedImageField(
        upload_to=story_cover_path,
        max_size=(800, 1200),
        blank=True,
        null=True,
        help_text="Cover image for the story series. Saved as: story-covers/YYYY/MM/slugified-title.webp"
    )
    cover_image_url = models.URLField(max_length=500, blank=True, default="")
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.DRAFT)
    is_featured = models.BooleanField(default=False, db_index=True, help_text="Feature this series on the stories homepage")
    total_episodes = models.PositiveSmallIntegerField(default=0, help_text="Auto-updated when episodes are added")
    views_total = models.PositiveIntegerField(default=0, db_index=True)

    # SEO/Social fields
    meta_title = models.CharField(max_length=300, blank=True, help_text="Custom title for SEO/social (falls back to series title)")
    meta_description = models.TextField(blank=True, help_text="Custom description for SEO/social (falls back to description)")
    social_snippet = models.CharField(max_length=280, blank=True, help_text="Short teaser for social media (falls back to subtitle or description)")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    published_at = models.DateTimeField(null=True, blank=True, db_index=True)

    class Meta:
        ordering = ("-is_featured", "-published_at", "-created_at")
        verbose_name_plural = "story series"

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)[:240]
            original_slug = self.slug
            counter = 1
            while StorySeries.objects.filter(slug=self.slug).exclude(pk=self.pk).exists():
                suffix = f"-{counter}"
                max_length = 240 - len(suffix)
                self.slug = f"{original_slug[:max_length]}{suffix}"
                counter += 1
        
        # Enforce only one featured story at a time
        if self.is_featured:
            StorySeries.objects.filter(is_featured=True).exclude(pk=self.pk).update(is_featured=False)
        
        super().save(*args, **kwargs)

    def __str__(self) -> str:
        author_name = self.author.get_full_name() or self.author.username if self.author else "Unknown"
        return f"{self.title} by {author_name}"

    def update_episode_count(self):
        """Recalculate total episodes."""
        self.total_episodes = self.episodes.filter(published_at__isnull=False).count()
        self.save(update_fields=["total_episodes"])


class StoryEpisode(models.Model):
    """Individual episode within a story series."""

    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        SCHEDULED = "scheduled", "Scheduled"
        PUBLISHED = "published", "Published"

    series = models.ForeignKey(StorySeries, on_delete=models.CASCADE, related_name="episodes")
    episode_number = models.PositiveSmallIntegerField(db_index=True)
    title = models.CharField(max_length=300)
    slug = models.SlugField(max_length=280, blank=True)
    excerpt = models.TextField(
        blank=True,
        help_text="Teaser/cliffhanger for this episode (for social media sharing)"
    )
    content = models.TextField(help_text="Full episode content")
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.DRAFT)
    published_at = models.DateTimeField(null=True, blank=True, db_index=True)
    scheduled_publish_at = models.DateTimeField(null=True, blank=True, db_index=True)
    views_total = models.PositiveIntegerField(default=0, db_index=True)
    read_time_minutes = models.PositiveSmallIntegerField(default=5)

    # Cliffhanger for next episode teaser
    next_episode_teaser = models.CharField(
        max_length=200,
        blank=True,
        help_text="Hook for the next episode (e.g., 'Will Brian find out the truth?')"
    )

    # Single image for episode
    image = ProcessedImageField(
        upload_to=episode_image_path,
        max_size=(1200, 800),
        blank=True,
        null=True,
        help_text="Upload an episode image. Will be automatically resized to max 1200x800 and converted to WebP format. Saved as: episode-images/YYYY/MM/series-title-episode-N.webp"
    )
    image_url = models.URLField(max_length=500, blank=True, default="", help_text="Optional external image URL")
    image_attribution = models.CharField(
        max_length=500,
        blank=True,
        help_text="e.g., 'Tony Webster from Minneapolis, Minnesota, United States, CC BY 2.0, via Wikimedia Commons'"
    )

    # SEO fields
    meta_title = models.CharField(max_length=500, blank=True, help_text="Custom title for SEO/social (falls back to episode title)")
    meta_description = models.TextField(blank=True, help_text="Custom description for SEO/social (falls back to excerpt)")
    meta_keywords = models.CharField(max_length=500, blank=True, help_text="Comma-separated keywords for SEO (e.g., 'village drama, campus life, fiction')")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("series", "episode_number")
        unique_together = [["series", "episode_number"]]
        verbose_name_plural = "story episodes"

    def save(self, *args, **kwargs):
        if not self.slug:
            base = f"{self.series.slug}-episode-{self.episode_number}"
            self.slug = base[:280]
            counter = 1
            while StoryEpisode.objects.filter(slug=self.slug).exclude(pk=self.pk).exists():
                suffix = f"-{counter}"
                max_length = 280 - len(suffix)
                self.slug = f"{base[:max_length]}{suffix}"
                counter += 1
        super().save(*args, **kwargs)
        # Update parent series episode count
        self.series.update_episode_count()

    def __str__(self) -> str:
        return f"{self.series.title} - Ep {self.episode_number}: {self.title}"

    def get_previous_episode(self):
        """Get the previous episode in the series."""
        return StoryEpisode.objects.filter(
            series=self.series,
            episode_number__lt=self.episode_number,
            status=self.Status.PUBLISHED
        ).order_by("-episode_number").first()

    def get_next_episode(self):
        """Get the next episode in the series."""
        return StoryEpisode.objects.filter(
            series=self.series,
            episode_number__gt=self.episode_number,
            status=self.Status.PUBLISHED
        ).order_by("episode_number").first()

    def is_first_episode(self):
        return self.episode_number == 1

    def is_last_published_episode(self):
        last = StoryEpisode.objects.filter(
            series=self.series,
            status=self.Status.PUBLISHED
        ).order_by("-episode_number").first()
        return last and last.id == self.id


# ============================================
# Story view counts (same fields as articles)
# ============================================

class StoryViewEvent(models.Model):
    """Raw view event for episodes (like ArticleViewEvent)."""
    episode = models.ForeignKey(StoryEpisode, on_delete=models.CASCADE, related_name="view_events")
    visitor_key = models.CharField(max_length=64, db_index=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.CharField(max_length=500, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ("-created_at",)
        verbose_name_plural = "story view events"


class StoryVisitorDay(models.Model):
    """Daily unique visitor counts per episode (like ArticleVisitorDay)."""
    episode = models.ForeignKey(StoryEpisode, on_delete=models.CASCADE, related_name="visitor_days")
    day = models.DateField(db_index=True)
    visitor_key = models.CharField(max_length=64, db_index=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)  # For cache-clear protection

    class Meta:
        unique_together = [["episode", "day", "visitor_key"]]
        indexes = [
            models.Index(fields=["episode", "day", "ip_address"]),
        ]
        ordering = ("-day",)
        verbose_name_plural = "story visitor days"


class StoryEpisodeComment(models.Model):
    """Comments on story episodes."""
    episode = models.ForeignKey(StoryEpisode, on_delete=models.CASCADE, related_name="comments")
    name = models.CharField(max_length=100, help_text="Your name")
    email = models.EmailField(blank=True, help_text="Optional - not displayed publicly")
    content = models.TextField(max_length=2000, help_text="Your comment")
    is_approved = models.BooleanField(default=False, db_index=True, help_text="Comments require approval")
    parent = models.ForeignKey(
        "self",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="replies"
    )
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name_plural = "story comments"

    def __str__(self) -> str:
        return f"Comment by {self.name} on Ep {self.episode.episode_number}"


class StoryEpisodeLike(models.Model):
    """Track likes on episodes (per visitor key to prevent duplicates)."""
    episode = models.ForeignKey(StoryEpisode, on_delete=models.CASCADE, related_name="likes")
    visitor_key = models.CharField(max_length=64, db_index=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.CharField(max_length=500, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = [["episode", "visitor_key"]]
        verbose_name_plural = "story likes"

    def __str__(self) -> str:
        return f"Like on Ep {self.episode.episode_number}"


class StoryShare(models.Model):
    """Track social shares of stories/episodes."""
    SHARE_CHOICES = [
        ("facebook", "Facebook"),
        ("whatsapp", "WhatsApp"),
        ("twitter", "Twitter/X"),
        ("copy", "Copy Link"),
    ]

    series = models.ForeignKey(StorySeries, on_delete=models.CASCADE, related_name="shares", null=True, blank=True)
    episode = models.ForeignKey(StoryEpisode, on_delete=models.CASCADE, related_name="shares", null=True, blank=True)
    platform = models.CharField(max_length=20, choices=SHARE_CHOICES)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "story shares"

    def __str__(self) -> str:
        if self.episode:
            return f"{self.platform} share of Ep {self.episode.episode_number}"
        return f"{self.platform} share of {self.series.title}"
