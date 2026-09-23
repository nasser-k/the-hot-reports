"""Shared admin image preview for upload + external URL fields."""
from __future__ import annotations

from django.contrib import admin
from django.utils.html import format_html

from pulse.media_urls import resolve_media_image


def media_preview_html(
    obj,
    *,
    file_attr: str,
    url_attr: str | None = None,
    request=None,
) -> str:
    if not obj or not getattr(obj, "pk", None):
        return "—"
    external = getattr(obj, url_attr, "") if url_attr else ""
    url = resolve_media_image(
        file_field=getattr(obj, file_attr, None),
        external_url=external,
        request=request,
        allow_none=True,
    )
    if not url:
        return "No image yet"
    return format_html(
        '<img src="{}" alt="Preview" style="max-height:160px;max-width:100%;'
        'border-radius:8px;border:1px solid #ddd;" />',
        url,
    )


class MediaPreviewMixin:
    """Set preview_upload_field and optional preview_external_field on ModelAdmin."""

    preview_upload_field: str = "image"
    preview_external_field: str | None = "image_url"

    @admin.display(description="Preview")
    def media_preview(self, obj):
        request = getattr(self, "_preview_request", None)
        return media_preview_html(
            obj,
            file_attr=self.preview_upload_field,
            url_attr=self.preview_external_field,
            request=request,
        )

    def get_readonly_fields(self, request, obj=None):
        fields = list(super().get_readonly_fields(request, obj))
        if "media_preview" not in fields:
            fields.append("media_preview")
        self._preview_request = request
        return fields

    def get_fieldsets(self, request, obj=None):
        self._preview_request = request
        return super().get_fieldsets(request, obj)
