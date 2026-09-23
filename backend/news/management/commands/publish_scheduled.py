from __future__ import annotations

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from news.models import Article, StoryEpisode
from news.indexing import notify_search_engines

User = get_user_model()


class Command(BaseCommand):
    help = "Publish scheduled articles and story episodes whose scheduled_publish_at <= now."

    def handle(self, *args, **options):
        now = timezone.now()
        articles_published = self._publish_articles(now)
        episodes_published = self._publish_episodes(now)

        if articles_published == 0 and episodes_published == 0:
            self.stdout.write("No scheduled articles or episodes due.")
            return
        if articles_published:
            self.stdout.write(self.style.SUCCESS(f"Published {articles_published} scheduled article(s)."))
        if episodes_published:
            self.stdout.write(self.style.SUCCESS(f"Published {episodes_published} scheduled episode(s)."))

    def _publish_articles(self, now) -> int:
        # Only auto-publish DRAFT or PENDING - never REJECTED
        qs = Article.objects.filter(
            status__in=[Article.Status.PENDING, Article.Status.DRAFT],
            scheduled_publish_at__isnull=False,
            scheduled_publish_at__lte=now,
        )
        count = 0
        for article in qs:
            with transaction.atomic():
                # Refresh from DB to avoid race conditions
                article.refresh_from_db()
                if article.status == Article.Status.REJECTED:
                    continue  # Skip if somehow got rejected during iteration

                article.status = Article.Status.PUBLISHED
                article.published_at = now
                article.scheduled_publish_at = None
                article.approved_at = now
                # Auto-approval: set approved_by to created_by (the author who scheduled it)
                if article.created_by:
                    article.approved_by = article.created_by
                article.save(update_fields=[
                    "status", "published_at", "scheduled_publish_at",
                    "approved_at", "approved_by"
                ])
            # Notify search engines for scheduled publish (outside transaction)
            try:
                notify_search_engines(article.slug, content_type="article")
            except Exception:
                pass  # Logged in indexing module
            count += 1
        return count

    def _publish_episodes(self, now) -> int:
        qs = StoryEpisode.objects.filter(
            status__in=[StoryEpisode.Status.DRAFT, StoryEpisode.Status.SCHEDULED],
            scheduled_publish_at__isnull=False,
            scheduled_publish_at__lte=now,
        ).select_related("series")
        count = 0
        for episode in qs:
            with transaction.atomic():
                # Refresh from DB to avoid race conditions
                episode.refresh_from_db()
                if episode.status not in [StoryEpisode.Status.DRAFT, StoryEpisode.Status.SCHEDULED]:
                    continue  # Skip if status changed during iteration

                episode.status = StoryEpisode.Status.PUBLISHED
                episode.published_at = now
                episode.scheduled_publish_at = None
                episode.save(update_fields=["status", "published_at", "scheduled_publish_at"])
            # Notify search engines for scheduled publish (outside transaction)
            try:
                notify_search_engines(episode.slug, content_type="episode")
            except Exception:
                pass  # Logged in indexing module
            count += 1
        return count

