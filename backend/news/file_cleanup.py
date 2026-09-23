"""File cleanup utilities for automatic deletion of orphaned media files."""

import logging
import re
from typing import Optional

from django.db.models.signals import pre_delete, pre_save
from django.dispatch import receiver
from django.core.files.storage import default_storage

from accounts.models import User
from ads.models import Ad
from tourism.models import TourismListing

from .models import Article, StoryEpisode, StorySeries

logger = logging.getLogger(__name__)


def _delete_file(file_field) -> bool:
    """Delete a file from storage if it exists."""
    if not file_field:
        return False
    try:
        if hasattr(file_field, 'storage') and file_field.name:
            file_field.storage.delete(file_field.name)
            return True
    except Exception as e:
        logger.error(f"Failed to delete file {file_field}: {e}")
    return False


def _get_file_path(file_field) -> Optional[str]:
    if not file_field:
        return None
    return file_field.name or None


# ==============================
# Article File Cleanup
# ==============================

@receiver(pre_delete, sender=Article)
def delete_article_image_on_delete(sender, instance, **kwargs):
    """Delete image file when article is deleted."""
    if instance.image:
        _delete_file(instance.image)
        logger.debug(f"Deleted article image for {instance.slug}")


@receiver(pre_save, sender=Article)
def delete_article_image_on_clear(sender, instance, **kwargs):
    """Delete old image file when article image is changed or cleared."""
    if not instance.pk:
        return  # New instance, nothing to delete
    
    try:
        old_instance = sender.objects.only('image').get(pk=instance.pk)
    except sender.DoesNotExist:
        return
    
    old_file = _get_file_path(old_instance.image)
    new_file = _get_file_path(instance.image)
    
    # File was cleared or changed to a different file
    if old_file and old_file != new_file:
        _delete_file(old_instance.image)
        logger.debug(f"Deleted old article image for {instance.slug}")


# ==============================
# StoryEpisode File Cleanup  
# ==============================

@receiver(pre_delete, sender=StoryEpisode)
def delete_episode_image_on_delete(sender, instance, **kwargs):
    """Delete image file when episode is deleted."""
    if instance.image:
        _delete_file(instance.image)
        logger.debug(f"Deleted episode image for {instance.slug}")


@receiver(pre_save, sender=StoryEpisode)
def delete_episode_image_on_clear(sender, instance, **kwargs):
    """Delete old image file when episode image is changed or cleared."""
    if not instance.pk:
        return
    
    try:
        old_instance = sender.objects.only('image').get(pk=instance.pk)
    except sender.DoesNotExist:
        return
    
    old_file = _get_file_path(old_instance.image)
    new_file = _get_file_path(instance.image)
    
    if old_file and old_file != new_file:
        _delete_file(old_instance.image)
        logger.debug(f"Deleted old episode image for {instance.slug}")


# ==============================
# StorySeries File Cleanup
# ==============================

@receiver(pre_delete, sender=StorySeries)
def delete_series_cover_on_delete(sender, instance, **kwargs):
    """Delete cover image file when series is deleted."""
    if instance.cover_image:
        _delete_file(instance.cover_image)
        logger.debug(f"Deleted series cover for {instance.slug}")


@receiver(pre_save, sender=StorySeries)
def delete_series_cover_on_clear(sender, instance, **kwargs):
    """Delete old cover file when series cover is changed or cleared."""
    if not instance.pk:
        return
    
    try:
        old_instance = sender.objects.only('cover_image').get(pk=instance.pk)
    except sender.DoesNotExist:
        return
    
    old_file = _get_file_path(old_instance.cover_image)
    new_file = _get_file_path(instance.cover_image)
    
    if old_file and old_file != new_file:
        _delete_file(old_instance.cover_image)
        logger.debug(f"Deleted old series cover for {instance.slug}")


# ==============================
# TourismListing File Cleanup
# ==============================

@receiver(pre_delete, sender=TourismListing)
def delete_tourism_image_on_delete(sender, instance, **kwargs):
    """Delete image file when tourism listing is deleted."""
    if instance.image:
        _delete_file(instance.image)
        logger.debug(f"Deleted tourism image for {instance.slug}")


@receiver(pre_save, sender=TourismListing)
def delete_tourism_image_on_clear(sender, instance, **kwargs):
    """Delete old image file when tourism listing image is changed or cleared."""
    if not instance.pk:
        return
    
    try:
        old_instance = sender.objects.only('image').get(pk=instance.pk)
    except sender.DoesNotExist:
        return
    
    old_file = _get_file_path(old_instance.image)
    new_file = _get_file_path(instance.image)
    
    if old_file and old_file != new_file:
        _delete_file(old_instance.image)
        logger.debug(f"Deleted old tourism image for {instance.slug}")


# ==============================
# User Avatar File Cleanup
# ==============================

@receiver(pre_delete, sender=User)
def delete_user_avatar_on_delete(sender, instance, **kwargs):
    """Delete avatar file when user is deleted."""
    if instance.avatar:
        _delete_file(instance.avatar)
        logger.debug(f"Deleted avatar for user {instance.email}")


@receiver(pre_save, sender=User)
def delete_user_avatar_on_clear(sender, instance, **kwargs):
    """Delete old avatar file when user avatar is changed or cleared."""
    if not instance.pk:
        return
    
    try:
        old_instance = sender.objects.only('avatar').get(pk=instance.pk)
    except sender.DoesNotExist:
        return
    
    old_file = _get_file_path(old_instance.avatar)
    new_file = _get_file_path(instance.avatar)
    
    if old_file and old_file != new_file:
        _delete_file(old_instance.avatar)
        logger.debug(f"Deleted old avatar for user {instance.email}")


# ==============================
# Ad Image File Cleanup
# ==============================

@receiver(pre_delete, sender=Ad)
def delete_ad_image_on_delete(sender, instance, **kwargs):
    """Delete image file when ad is deleted."""
    if instance.image:
        _delete_file(instance.image)
        logger.debug(f"Deleted ad image for {instance.name}")


@receiver(pre_save, sender=Ad)
def delete_ad_image_on_clear(sender, instance, **kwargs):
    """Delete old image file when ad image is changed or cleared."""
    if not instance.pk:
        return
    
    try:
        old_instance = sender.objects.only('image').get(pk=instance.pk)
    except sender.DoesNotExist:
        return
    
    old_file = _get_file_path(old_instance.image)
    new_file = _get_file_path(instance.image)
    
    if old_file and old_file != new_file:
        _delete_file(old_instance.image)
        logger.debug(f"Deleted old ad image for {instance.name}")


# ==============================
# Content-Images Cleanup (CKEditor)
# ==============================

def _extract_content_image_paths(html_content: str) -> list:
    """Extract content-image paths from HTML content."""
    if not html_content:
        return []
    # Match /media/content-images/YYYY/MM/filename.webp patterns
    pattern = r'(?:https?://[^\s"\'>]*)?/media/(content-images/[^\s"\'<>\)]+)'
    matches = re.findall(pattern, html_content)
    # Remove duplicates while preserving order
    seen = set()
    unique_paths = []
    for path in matches:
        if path not in seen:
            seen.add(path)
            unique_paths.append(path)
    return unique_paths


def _delete_content_image(path: str) -> bool:
    """Delete a content-image file from storage."""
    try:
        if default_storage.exists(path):
            default_storage.delete(path)
            logger.debug(f"Deleted content-image: {path}")
            return True
    except Exception as e:
        logger.error(f"Failed to delete content-image {path}: {e}")
    return False


def _cleanup_content_images(html_content: str) -> int:
    """Delete all content-images referenced in HTML."""
    paths = _extract_content_image_paths(html_content)
    deleted_count = 0
    for path in paths:
        if _delete_content_image(path):
            deleted_count += 1
    return deleted_count


@receiver(pre_delete, sender=Article)
def delete_article_content_images(sender, instance, **kwargs):
    """Delete content-images when article is deleted."""
    deleted = _cleanup_content_images(instance.content)
    if deleted:
        logger.info(f"Deleted {deleted} content-images for article {instance.slug}")


@receiver(pre_save, sender=Article)
def cleanup_article_removed_images(sender, instance, **kwargs):
    """Delete content-images removed from article content on update."""
    if not instance.pk:
        return
    try:
        old_instance = sender.objects.only('content').get(pk=instance.pk)
    except sender.DoesNotExist:
        return
    old_images = set(_extract_content_image_paths(old_instance.content))
    new_images = set(_extract_content_image_paths(instance.content))
    removed_images = old_images - new_images
    for path in removed_images:
        if _delete_content_image(path):
            logger.debug(f"Deleted removed content-image from article {instance.slug}: {path}")


@receiver(pre_delete, sender=StoryEpisode)
def delete_episode_content_images(sender, instance, **kwargs):
    """Delete content-images when episode is deleted."""
    deleted = _cleanup_content_images(instance.content)
    if deleted:
        logger.info(f"Deleted {deleted} content-images for episode {instance.slug}")


@receiver(pre_save, sender=StoryEpisode)
def cleanup_episode_removed_images(sender, instance, **kwargs):
    """Delete content-images removed from episode content on update."""
    if not instance.pk:
        return
    try:
        old_instance = sender.objects.only('content').get(pk=instance.pk)
    except sender.DoesNotExist:
        return
    old_images = set(_extract_content_image_paths(old_instance.content))
    new_images = set(_extract_content_image_paths(instance.content))
    removed_images = old_images - new_images
    for path in removed_images:
        if _delete_content_image(path):
            logger.debug(f"Deleted removed content-image from episode {instance.slug}: {path}")


@receiver(pre_delete, sender=TourismListing)
def delete_tourism_content_images(sender, instance, **kwargs):
    """Delete content-images when tourism listing is deleted."""
    deleted = _cleanup_content_images(instance.description)
    if deleted:
        logger.info(f"Deleted {deleted} content-images for tourism {instance.slug}")


@receiver(pre_save, sender=TourismListing)
def cleanup_tourism_removed_images(sender, instance, **kwargs):
    """Delete content-images removed from tourism listing description on update."""
    if not instance.pk:
        return
    try:
        old_instance = sender.objects.only('description').get(pk=instance.pk)
    except sender.DoesNotExist:
        return
    old_images = set(_extract_content_image_paths(old_instance.description))
    new_images = set(_extract_content_image_paths(instance.description))
    removed_images = old_images - new_images
    for path in removed_images:
        if _delete_content_image(path):
            logger.debug(f"Deleted removed content-image from tourism {instance.slug}: {path}")
