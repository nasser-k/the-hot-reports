"""Visitor key derivation for analytics (hybrid client UUID + daily server hash)."""

from __future__ import annotations

import hashlib
import re
import uuid
from datetime import date

from django.conf import settings
from django.utils import timezone


_UUID_RE = re.compile(
    r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$",
    re.IGNORECASE,
)


def normalize_visitor_id(raw: str | None) -> str | None:
    if not raw or not isinstance(raw, str):
        return None
    s = raw.strip()
    if not _UUID_RE.match(s):
        return None
    try:
        uuid.UUID(s)
    except ValueError:
        return None
    return s.lower()


def get_client_ip(request) -> str | None:
    """Client IP behind a reverse proxy."""
    x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR", "")
    if x_forwarded_for:
        ip = x_forwarded_for.split(",")[0].strip()
        if ip:
            return ip
    return request.META.get("REMOTE_ADDR") or None


def visitor_key_from_request(request, visitor_id: str | None, *, day: date | None = None) -> str:
    """Stable key for dedupe: prefer client UUID, else daily-rotating hash of IP+UA."""
    norm = normalize_visitor_id(visitor_id)
    if norm:
        return f"vid:{norm}"

    day = day or timezone.now().date()
    ip = get_client_ip(request) or ""
    ua = (request.META.get("HTTP_USER_AGENT") or "")[:400]
    salt = getattr(settings, "HOTREPORTS_VISITOR_HASH_SALT", "") or settings.SECRET_KEY
    digest = hashlib.sha256(f"{salt}|{ip}|{ua}|{day.isoformat()}".encode()).hexdigest()[:32]
    return f"ip:{digest}"
