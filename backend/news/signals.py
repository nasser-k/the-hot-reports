"""Signals for sending push notifications when articles are published."""

import logging

from django.db.models.signals import pre_save, post_save
from django.dispatch import receiver
from django.utils import timezone

from .models import Article, StoryEpisode
from .notifications import notify_new_article, notify_new_episode
from .indexing import notify_search_engines

logger = logging.getLogger(__name__)

_PUBLISH_TRANSITION_ATTR = "_was_unpublished"


@receiver(pre_save, sender=Article)
def track_publish_transition(sender, instance, **kwargs):
    """Record whether this save represents a transition to PUBLISHED."""
    if instance.pk is None:
        # New instance — will be caught by post_save created=True
        setattr(instance, _PUBLISH_TRANSITION_ATTR, False)
        return
    try:
        old = sender.objects.only("status").get(pk=instance.pk)
        # Transition TO published: old was not published AND new is published
        is_transition_to_published = (
            old.status != Article.Status.PUBLISHED
            and instance.status == Article.Status.PUBLISHED
        )
        setattr(instance, _PUBLISH_TRANSITION_ATTR, is_transition_to_published)
    except sender.DoesNotExist:
        setattr(instance, _PUBLISH_TRANSITION_ATTR, False)


@receiver(post_save, sender=Article)
def send_notification_on_publish(sender, instance, created, **kwargs):
    """Send push notification when an article is published (new or scheduled)."""
    if instance.status != Article.Status.PUBLISHED:
        return

    if instance.published_at and instance.published_at > timezone.now():
        # Scheduled for future, don't notify yet
        return

    # Notify on creation directly as published, or on transition from non-published
    transitioning = getattr(instance, _PUBLISH_TRANSITION_ATTR, False)
    if not created and not transitioning:
        return

    # Check if it's a breaking news article
    is_breaking = instance.highlight == Article.Highlight.BREAKING

    # Send notification (run in background to not block the request)
    # In production, you might want to use a task queue like Celery
    try:
        notify_new_article(instance, is_breaking=is_breaking)
    except Exception as e:
        # Log error but don't prevent article creation
        logger.error(f"Failed to send push notification: {e}")

    # Notify search engines for indexing
    try:
        notify_search_engines(instance.slug, content_type="article")
    except Exception as e:
        logger.error(f"Failed to notify search engines: {e}")


@receiver(pre_save, sender=StoryEpisode)
def track_episode_publish_transition(sender, instance, **kwargs):
    """Record whether this save represents a transition to PUBLISHED."""
    if instance.pk is None:
        setattr(instance, _PUBLISH_TRANSITION_ATTR, False)
        return
    try:
        old = sender.objects.only("status").get(pk=instance.pk)
        # Transition TO published: old was not published AND new is published
        is_transition_to_published = (
            old.status != StoryEpisode.Status.PUBLISHED
            and instance.status == StoryEpisode.Status.PUBLISHED
        )
        setattr(instance, _PUBLISH_TRANSITION_ATTR, is_transition_to_published)
    except sender.DoesNotExist:
        setattr(instance, _PUBLISH_TRANSITION_ATTR, False)


@receiver(post_save, sender=StoryEpisode)
def send_notification_on_episode_publish(sender, instance, created, **kwargs):
    """Send push notification when a story episode is published (new or scheduled)."""
    if instance.status != StoryEpisode.Status.PUBLISHED:
        return

    if instance.published_at and instance.published_at > timezone.now():
        return

    transitioning = getattr(instance, _PUBLISH_TRANSITION_ATTR, False)
    if not created and not transitioning:
        return

    try:
        notify_new_episode(instance)
    except Exception as e:
        logger.error(f"Failed to send episode push notification: {e}")

    # Notify search engines for indexing
    try:
        notify_search_engines(instance.slug, content_type="episode")
    except Exception as e:
        logger.error(f"Failed to notify search engines: {e}")
