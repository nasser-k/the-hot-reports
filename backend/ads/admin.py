"""
Django Admin for ads.

1. python manage.py setup_ad_slots
2. Create Ads: slot, dates, image, link; mark house ads where needed
"""
from django.contrib import admin

from pulse.admin_media import MediaPreviewMixin
from pulse.admin_roles import FilterActionsMixin, NoActionsMixin, can_manage_ads

from .models import AdSlot, Ad, AdEvent


class AdsManagerPermissionMixin:
    """Mixin to restrict access to Ads Managers, Editors, and Superusers."""

    def has_module_permission(self, request):
        return can_manage_ads(request.user)

    def has_view_permission(self, request, obj=None):
        return can_manage_ads(request.user)

    def has_add_permission(self, request):
        return can_manage_ads(request.user)

    def has_change_permission(self, request, obj=None):
        return can_manage_ads(request.user)

    def has_delete_permission(self, request, obj=None):
        return can_manage_ads(request.user)


@admin.register(AdSlot)
class AdSlotAdmin(AdsManagerPermissionMixin, NoActionsMixin, admin.ModelAdmin):
    list_display = ("slot_key", "name", "is_active")
    list_filter = ("is_active",)
    search_fields = ("slot_key", "name")
    readonly_fields = ("slot_key", "name", "is_active")

    def has_add_permission(self, request):
        # Slots should only be added via manage.py setup_ad_slots
        return False

    def has_change_permission(self, request, obj=None):
        # Slots are read-only, managed via code
        return False

    def has_delete_permission(self, request, obj=None):
        # Slots are read-only, managed via code
        return False


@admin.register(Ad)
class AdAdmin(AdsManagerPermissionMixin, FilterActionsMixin, MediaPreviewMixin, admin.ModelAdmin):
    def allowed_action_names(self, request):
        if can_manage_ads(request.user):
            return {"delete_selected"}
        return set()

    preview_external_field = None
    list_display = (
        "name",
        "client_name",
        "slot",
        "is_running_display",
        "is_house_ad",
        "priority",
        "impressions",
        "clicks",
        "ctr_display",
    )
    list_filter = (
        "is_active",
        "is_house_ad",
        "slot",
        ("start_date", admin.DateFieldListFilter),
    )
    search_fields = ("name", "client_name", "link_url")
    date_hierarchy = "start_date"

    fieldsets = (
        (None, {"fields": ("name", "client_name", "is_house_ad")}),
        ("Creative", {"fields": ("media_preview", "image", "link_url", "alt_text")}),
        ("Placement & schedule", {"fields": ("slot", "start_date", "end_date", "priority")}),
        ("Status & stats", {"fields": ("is_active", "impressions", "clicks"), "classes": ("collapse",)}),
    )
    readonly_fields = ("impressions", "clicks")

    def is_running_display(self, obj: Ad) -> str:
        return "Running" if obj.is_running() else "Not running"

    is_running_display.short_description = "Schedule"

    def ctr_display(self, obj: Ad) -> str:
        return f"{obj.ctr}%"

    ctr_display.short_description = "CTR"


@admin.register(AdEvent)
class AdEventAdmin(AdsManagerPermissionMixin, FilterActionsMixin, admin.ModelAdmin):
    def allowed_action_names(self, request):
        if can_manage_ads(request.user):
            return {"delete_selected"}
        return set()

    list_display = ("ad", "event_type", "created_at", "page_path")
    list_filter = ("event_type", "created_at")
    search_fields = ("ad__name", "ad__client_name", "page_path")
    date_hierarchy = "created_at"
    readonly_fields = ("ad", "event_type", "created_at", "ip_address", "user_agent", "page_path")

    def has_add_permission(self, request, obj=None):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        # Allow deletion so parent Ads can be deleted (cascade)
        return can_manage_ads(request.user)
