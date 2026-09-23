from django.contrib import admin

from pulse.admin_media import MediaPreviewMixin
from pulse.admin_roles import FilterActionsMixin, is_editor

from .models import User


@admin.register(User)
class UserAdmin(FilterActionsMixin, MediaPreviewMixin, admin.ModelAdmin):
    def allowed_action_names(self, request):
        if request.user.is_superuser:
            return None
        return set()

    preview_upload_field = "avatar"
    preview_external_field = "avatar_url"
    ordering = ("email",)
    list_display = ("email", "full_name", "role", "is_superuser", "is_active", "date_joined")
    list_filter = ("is_superuser", "is_active", "groups", "date_joined")
    search_fields = ("email", "full_name")
    filter_horizontal = ("groups", "user_permissions")
    readonly_fields = ("last_login", "date_joined", "password")

    def has_module_permission(self, request):
        """Superusers and Editors can access users module."""
        return is_editor(request.user)

    def has_view_permission(self, request, obj=None):
        """Superusers and Editors can view team members."""
        return is_editor(request.user)

    def has_add_permission(self, request):
        """Only superusers can add users."""
        return request.user.is_superuser

    def has_change_permission(self, request, obj=None):
        """Only superusers can change users."""
        return request.user.is_superuser

    def has_delete_permission(self, request, obj=None):
        """Only superusers can delete users."""
        return request.user.is_superuser

    fieldsets = (
        ("Account", {
            "fields": ("email", "password")
        }),
        ("Personal Information", {
            "fields": ("full_name", "role", "media_preview", "avatar", "avatar_url", "phone", "bio"),
            "description": "Upload takes priority. Default avatar is used when both are empty.",
        }),
        ("Permissions", {
            "fields": ("is_active", "is_superuser", "groups", "user_permissions"),
            "description": "Superusers have full access. Users in 'Editor' or 'Ads Manager' groups get admin access to their respective areas."
        }),
        ("Important Dates", {
            "fields": ("last_login", "date_joined"),
            "classes": ("collapse",)
        }),
    )
