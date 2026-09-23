from django.contrib import admin

from pulse.admin_media import MediaPreviewMixin
from pulse.admin_roles import FilterActionsMixin, can_manage_ads

from .forms import TourismListingAdminForm
from .models import TourismListing


@admin.register(TourismListing)
class TourismListingAdmin(FilterActionsMixin, MediaPreviewMixin, admin.ModelAdmin):
    def allowed_action_names(self, request):
        if can_manage_ads(request.user):
            return {"delete_selected"}
        return set()

    change_form_template = "admin/tourism/tourismlisting/change_form.html"
    form = TourismListingAdminForm

    list_display = ("name", "listing_type", "location", "featured", "rating")
    list_filter = ("listing_type", "featured")
    search_fields = ("name", "slug", "location")

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

    readonly_fields = ("slug", "created_by")

    def save_model(self, request, obj, form, change):
        if not obj.created_by:
            obj.created_by = request.user
        super().save_model(request, obj, form, change)

    fieldsets = (
        ("Basic Information", {
            "fields": ("name", "slug", "listing_type", "tagline", "description"),
            "description": "Slug is auto-generated from the name."
        }),
        ("Images", {
            "fields": ("media_preview", "image", "image_url", "image_attribution"),
            "description": "Upload takes priority over external URL. Attribution is shown as photo credit.",
        }),
        ("Details", {
            "fields": ("location", "price_range", "rating", "featured")
        }),
        ("Contact", {
            "fields": ("website", "phone")
        }),
        ("Tags", {
            "fields": ("tags",)
        }),
        ("SEO", {
            "fields": ("meta_title", "meta_description", "meta_keywords"),
            "description": "Leave empty to auto-generate: meta_title→listing name, meta_description→tagline, meta_keywords→none."
        }),
        ("Tracking", {
            "fields": ("created_by",),
            "classes": ("collapse",),
        }),
    )
