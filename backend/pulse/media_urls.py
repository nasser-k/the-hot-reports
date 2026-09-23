"""
Media URL helpers for API responses and admin.
"""
from __future__ import annotations

from django.conf import settings

DEFAULT_AVATAR_PATH = "/static/avatars/default-avatar.png"


def absolute_url(path_or_url: str, request=None) -> str:
    """Return an absolute URL for either absolute URLs or local paths."""
    if not path_or_url:
        return path_or_url
    if path_or_url.startswith(("http://", "https://")):
        return path_or_url
    if request is not None:
        return request.build_absolute_uri(path_or_url)
    backend_url = getattr(settings, "BACKEND_URL", "").rstrip("/")
    if backend_url:
        return f"{backend_url}{path_or_url}"
    return path_or_url


def default_avatar_url(request=None) -> str:
    return absolute_url(DEFAULT_AVATAR_PATH, request=request)


def uploaded_file_url(file_field, request=None) -> str | None:
    """Absolute URL for a FileField/ImageField, or None if missing."""
    if not file_field:
        return None
    try:
        relative = file_field.url
    except Exception:
        return None
    if not relative:
        return None
    return absolute_url(relative, request=request)


def resolve_media_image(
    *,
    file_field,
    external_url: str = "",
    request=None,
    allow_none: bool = False,
) -> str | None:
    """
    Uploaded file wins over external URL (matches admin help text).
    """
    uploaded = uploaded_file_url(file_field, request)
    if uploaded:
        return uploaded
    external = (external_url or "").strip()
    if external:
        return absolute_url(external, request=request)
    return None if allow_none else ""
