"""Push notification utilities for Web Push."""

import json
import logging

from decouple import config
from pywebpush import webpush, WebPushException

from .models import PushSubscription, StoryEpisode

logger = logging.getLogger(__name__)


def get_vapid_keys():
    """Get VAPID keys from environment."""
    return {
        "public": config("VAPID_PUBLIC_KEY", default=""),
        "private": config("VAPID_PRIVATE_KEY", default=""),
        "admin_email": config("VAPID_ADMIN_EMAIL", default="admin@thehotreports.com"),
    }


def send_push_notification(
    subscription: PushSubscription,
    title: str,
    body: str,
    url: str = "/",
    icon: str = "/android-chrome-192x192.png",
    badge: str = "/android-chrome-192x192.png",
    tag: str = "news",
    require_interaction: bool = False,
) -> bool:
    """Send a push notification to a single subscription."""
    vapid = get_vapid_keys()

    if not vapid["private"] or not vapid["public"]:
        logger.warning("VAPID keys not configured")
        return False

    payload = {
        "title": title,
        "body": body,
        "icon": icon,
        "badge": badge,
        "tag": tag,
        "requireInteraction": require_interaction,
        "data": {
            "url": url,
        },
        "actions": [
            {"action": "open", "title": "Read Now"},
            {"action": "close", "title": "Dismiss"},
        ],
    }

    try:
        webpush(
            subscription_info=subscription.to_webpush_format(),
            data=json.dumps(payload),
            vapid_private_key=vapid["private"],
            vapid_claims={
                "sub": f"mailto:{vapid['admin_email']}",
            },
        )
        # Update notification count
        subscription.notification_count += 1
        subscription.save(update_fields=["notification_count", "last_used"])
        return True
    except WebPushException as e:
        # Check if subscription is expired/invalid
        if e.response and e.response.status_code in (404, 410):
            subscription.is_active = False
            subscription.save(update_fields=["is_active"])
            logger.warning(f"Subscription {subscription.id} marked inactive: endpoint expired")
        else:
            logger.error(f"Push notification failed for {subscription.id}: {e}")
        return False
    except Exception as e:
        logger.exception(f"Unexpected error sending push notification: {e}")
        return False


def broadcast_notification(
    title: str,
    body: str,
    url: str = "/",
    icon: str = "/icons/icon-192.png",
    tag: str = "news",
) -> dict:
    """Send a notification to all active subscriptions."""
    subscriptions = PushSubscription.objects.filter(is_active=True)

    success_count = 0
    fail_count = 0

    for sub in subscriptions:
        success = send_push_notification(
            subscription=sub,
            title=title,
            body=body,
            url=url,
            icon=icon,
            tag=tag,
        )
        if success:
            success_count += 1
        else:
            fail_count += 1

    return {
        "sent": success_count,
        "failed": fail_count,
        "total": success_count + fail_count,
    }


def notify_new_article(article, is_breaking: bool = False) -> dict:
    """Send notification for a newly published article."""
    title = f"{'BREAKING: ' if is_breaking else 'New Article: '}{article.title[:60]}"
    if len(article.title) > 60:
        title += "..."

    body = article.excerpt[:100]
    if len(article.excerpt) > 100:
        body += "..."

    url = f"/article/{article.slug}"
    tag = "breaking-news" if is_breaking else "new-article"

    return broadcast_notification(
        title=title,
        body=body,
        url=url,
        tag=tag,
    )


def notify_new_episode(episode: StoryEpisode) -> dict:
    """Send notification for a newly published story episode."""
    series_title = episode.series.title[:40]
    if len(episode.series.title) > 40:
        series_title += "..."

    title = f"New Episode: {series_title} — Ep. {episode.episode_number}"

    body = episode.excerpt[:100] if episode.excerpt else episode.title
    if len(body) == 100:
        body += "..."

    url = f"/stories/episode/{episode.slug}"

    return broadcast_notification(
        title=title,
        body=body,
        url=url,
        tag="new-episode",
    )
