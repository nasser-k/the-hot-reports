"""Upload path helpers under MEDIA_ROOT."""
from __future__ import annotations

import os
from datetime import datetime
from typing import TYPE_CHECKING

from django.utils.text import slugify

if TYPE_CHECKING:
    from django.db.models import Model


def _dated_path(folder: str, slug: str, filename: str) -> str:
    now = datetime.now()
    ext = os.path.splitext(filename)[1].lower()
    if ext not in {".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp"}:
        ext = ".webp"
    return f"{folder}/{now:%Y/%m}/{slugify(slug)[:100]}{ext}"


def article_image_path(instance: "Model", filename: str) -> str:
    title = getattr(instance, "title", None) or "unnamed"
    return _dated_path("article-images", title, filename)


def story_cover_path(instance: "Model", filename: str) -> str:
    title = getattr(instance, "title", None) or "unnamed"
    return _dated_path("story-covers", title, filename)


def episode_image_path(instance: "Model", filename: str) -> str:
    series = getattr(getattr(instance, "series", None), "title", "episode")
    number = getattr(instance, "episode_number", 0)
    return _dated_path("episode-images", f"{series}-episode-{number}", filename)


def tourism_image_path(instance: "Model", filename: str) -> str:
    name = getattr(instance, "name", None) or "unnamed"
    return _dated_path("tourism-images", name, filename)


def avatar_image_path(instance: "Model", filename: str) -> str:
    name = getattr(instance, "full_name", None) or getattr(instance, "email", "user")
    return _dated_path("avatars", name, filename)
