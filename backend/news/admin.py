from django.contrib import admin, messages
from django.utils import timezone

from pulse.admin_media import MediaPreviewMixin
from pulse.admin_roles import (
    FilterActionsMixin,
    NoActionsMixin,
    can_manage_ads,
    is_content_creator,
    is_editor,
    is_reporter,
    is_storywriter,
)

from .forms import ArticleAdminForm, StoryEpisodeAdminForm, StorySeriesAdminForm
from .models import (
    Article,
    Category,
    ContactMessage,
    NewsletterSubscriber,
    StoryEpisode,
    StoryEpisodeComment,
    StoryEpisodeLike,
    StorySeries,
    StoryShare,
    StoryViewEvent,
    StoryVisitorDay,
    Tag,
)


# Mixin for storywriter permissions
class StorywriterPermissionMixin:
    """Mixin providing storywriter permission logic for story-related admin classes."""

    def has_add_permission(self, request):
        return request.user.is_superuser or is_storywriter(request.user)

    def has_change_permission(self, request, obj=None):
        return request.user.is_superuser or is_storywriter(request.user)


@admin.register(Category)
class CategoryAdmin(FilterActionsMixin, admin.ModelAdmin):
    def allowed_action_names(self, request):
        if is_editor(request.user):
            return {"delete_selected"}
        return set()

    list_display = ("name", "slug", "color", "order", "article_count")
    list_editable = ("order",)
    search_fields = ("name", "slug")
    readonly_fields = ("slug",)
    ordering = ("order", "name")
    
    fieldsets = (
        (None, {
            "fields": ("name", "slug", "color", "order"),
            "description": "Slug is auto-generated from the name."
        }),
    )
    
    def article_count(self, obj):
        return obj.articles.count()
    article_count.short_description = "Articles"


@admin.register(Tag)
class TagAdmin(FilterActionsMixin, admin.ModelAdmin):
    def allowed_action_names(self, request):
        if is_editor(request.user):
            return {"delete_selected"}
        return set()

    list_display = ("name", "slug", "article_count")
    search_fields = ("name", "slug")
    readonly_fields = ("slug",)
    
    fieldsets = (
        (None, {
            "fields": ("name", "slug"),
            "description": "Slug is auto-generated from the name."
        }),
    )
    
    def article_count(self, obj):
        return obj.articles.count()
    article_count.short_description = "Articles"


@admin.register(Article)
class ArticleAdmin(FilterActionsMixin, MediaPreviewMixin, admin.ModelAdmin):
    change_form_template = "admin/news/article/change_form.html"
    form = ArticleAdminForm

    list_display = (
        "title",
        "status",
        "category",
        "author",
        "created_by",
        "published_at",
        "highlight",
    )
    list_filter = ("status", "category", "highlight", "published_at", "created_by")
    search_fields = ("title", "slug", "excerpt", "content")
    readonly_fields = ("slug", "created_at", "updated_at", "approved_at", "approved_by", "created_by", "author")
    filter_horizontal = ("tags",)
    date_hierarchy = "published_at"
    actions = ("submit_for_review", "approve_and_publish", "reject_articles")

    def allowed_action_names(self, request):
        if is_editor(request.user):
            return {"approve_and_publish", "reject_articles", "delete_selected"}
        if is_reporter(request.user):
            return {"submit_for_review"}
        return set()

    fieldsets = (
        ("Article Content", {
            "fields": ("title", "slug", "excerpt", "content"),
            "description": "Slug is auto-generated from the title."
        }),
        ("Classification", {
            "fields": ("category",),
            "description": "Category for article classification."
        }),
        ("Tags", {
            "fields": ("tags",)
        }),
        ("Images", {
            "fields": ("media_preview", "image", "image_url", "image_attribution"),
            "description": "Upload takes priority over external URL. Files are stored on the server media disk. Attribution is shown as photo credit.",
        }),
        ("SEO", {
            "fields": ("meta_title", "meta_description", "meta_keywords"),
            "description": "Leave empty to auto-generate: meta_title→title, meta_description→excerpt, meta_keywords→none."
        }),
        ("Metadata", {
            "fields": ("read_time", "status", "highlight"),
            "description": "Highlight: Article can be featured, breaking, trending, or none (only one at a time)."
        }),
        ("Publishing", {
            "fields": ("published_at", "scheduled_publish_at"),
            "description": "Only editors can modify these fields."
        }),
        ("Tracking", {
            "fields": ("author", "created_by", "approved_by", "approved_at", "created_at", "updated_at"),
            "classes": ("collapse",),
            "description": "Author is auto-set and read-only. Other tracking fields are system-managed."
        }),
    )

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        if is_editor(request.user):
            return qs
        if is_content_creator(request.user):
            return qs.filter(created_by=request.user)
        return qs

    def get_readonly_fields(self, request, obj=None):
        ro = set(super().get_readonly_fields(request, obj))
        workflow_fields = {
            "status",
            "highlight",
            "published_at",
            "scheduled_publish_at",
            "approved_by",
            "approved_at",
            "created_by",
        }
        if is_editor(request.user):
            ro -= {"status", "highlight", "published_at", "scheduled_publish_at"}
            ro |= {"approved_by", "approved_at", "created_by"}
        else:
            ro |= workflow_fields
        return list(ro)

    def get_fieldsets(self, request, obj=None):
        """Hide author field for content creators (reporters/storywriters) - it's always them."""
        fieldsets = list(super().get_fieldsets(request, obj))

        if is_content_creator(request.user) and not is_editor(request.user):
            # Remove author from Tracking fieldset for content creators (it's auto-set)
            for i, (name, options) in enumerate(fieldsets):
                if name == "Tracking":
                    fields = list(options.get("fields", ()))
                    new_fields = [f for f in fields if f != "author"]
                    fieldsets[i] = (name, {**options, "fields": new_fields})
                    break
        
        return fieldsets

    def _sync_article_status(self, request, obj, *, change: bool):
        """Keep publish metadata aligned when status is changed on the form."""
        now = timezone.now()
        previous_status = None
        if change and obj.pk:
            previous_status = (
                Article.objects.filter(pk=obj.pk).values_list("status", flat=True).first()
            )

        if obj.status == Article.Status.PUBLISHED:
            if not obj.published_at:
                obj.published_at = now
            if not obj.approved_by_id:
                obj.approved_by = request.user
            if not obj.approved_at:
                obj.approved_at = now
            obj.scheduled_publish_at = None
        elif obj.status in {Article.Status.REJECTED, Article.Status.PENDING}:
            obj.scheduled_publish_at = None
        elif (
            obj.status == Article.Status.DRAFT
            and previous_status == Article.Status.PUBLISHED
        ):
            obj.highlight = Article.Highlight.NONE

        return obj

    def save_model(self, request, obj, form, change):
        if not obj.created_by:
            obj.created_by = request.user
        
        # Auto-set author to current user for content creators (author is read-only in form)
        if is_content_creator(request.user) and not is_editor(request.user):
            obj.author = request.user

        # Validate author exists before saving
        if obj.author and not obj.author.pk:
            messages.error(request, "Invalid author selected.")
            return

        if not is_editor(request.user):
            # Reporters can only create/update drafts; cannot publish or schedule.
            if obj.created_by_id != request.user.id:
                messages.error(request, "You can only edit your own articles.")
                return
            if change and obj.status in {Article.Status.PUBLISHED, Article.Status.PENDING}:
                messages.error(request, "You cannot edit articles that are pending review or published.")
                return
            obj.status = Article.Status.DRAFT
            obj.scheduled_publish_at = None
            obj.highlight = Article.Highlight.NONE
        else:
            obj = self._sync_article_status(request, obj, change=change)

        super().save_model(request, obj, form, change)

    @admin.action(description="Submit selected articles for editor review")
    def submit_for_review(self, request, queryset):
        if is_editor(request.user):
            self.message_user(
                request,
                "Editors should use Approve and publish or Reject.",
                level=messages.ERROR,
            )
            return
        drafts = queryset.filter(created_by=request.user, status=Article.Status.DRAFT)
        updated = drafts.update(status=Article.Status.PENDING)
        skipped = queryset.count() - updated
        if updated:
            self.message_user(request, f"Submitted {updated} article(s) for review.", level=messages.SUCCESS)
        if skipped:
            self.message_user(
                request,
                f"Skipped {skipped} article(s) — only your own drafts can be submitted.",
                level=messages.WARNING,
            )

    @admin.action(description="Approve and publish selected articles")
    def approve_and_publish(self, request, queryset):
        if not is_editor(request.user):
            self.message_user(
                request,
                "You don't have permission to approve/publish.",
                level=messages.ERROR,
            )
            return

        count = 0
        for article in queryset:
            article.status = Article.Status.PUBLISHED
            article = self._sync_article_status(request, article, change=True)
            article.save(update_fields=[
                "status", "published_at", "approved_by", "approved_at", "scheduled_publish_at"
            ])
            count += 1

        self.message_user(request, f"Published {count} article(s).", level=messages.SUCCESS)

    @admin.action(description="Reject selected articles")
    def reject_articles(self, request, queryset):
        if not is_editor(request.user):
            self.message_user(
                request,
                "You don't have permission to reject.",
                level=messages.ERROR,
            )
            return

        count = 0
        for article in queryset:
            article.status = Article.Status.REJECTED
            article = self._sync_article_status(request, article, change=True)
            article.save(update_fields=["status", "scheduled_publish_at"])
            count += 1
        self.message_user(request, f"Rejected {count} article(s).", level=messages.SUCCESS)


@admin.register(NewsletterSubscriber)
class NewsletterSubscriberAdmin(FilterActionsMixin, admin.ModelAdmin):
    def allowed_action_names(self, request):
        if is_editor(request.user):
            return {"confirm_subscribers", "unconfirm_subscribers", "delete_selected"}
        return set()

    list_display = ("email", "confirmed", "created_at")
    list_filter = ("confirmed", "created_at")
    search_fields = ("email",)
    readonly_fields = ("created_at",)
    date_hierarchy = "created_at"
    actions = ("confirm_subscribers", "unconfirm_subscribers")
    
    fieldsets = (
        (None, {
            "fields": ("email", "confirmed", "created_at")
        }),
    )
    
    @admin.action(description="Confirm selected subscribers")
    def confirm_subscribers(self, request, queryset):
        updated = queryset.update(confirmed=True)
        self.message_user(request, f"Confirmed {updated} subscriber(s).", level=messages.SUCCESS)
    
    @admin.action(description="Unconfirm selected subscribers")
    def unconfirm_subscribers(self, request, queryset):
        updated = queryset.update(confirmed=False)
        self.message_user(request, f"Unconfirmed {updated} subscriber(s).", level=messages.SUCCESS)


@admin.register(ContactMessage)
class ContactMessageAdmin(FilterActionsMixin, admin.ModelAdmin):
    def allowed_action_names(self, request):
        if can_manage_ads(request.user):
            return {"mark_as_handled", "mark_as_unhandled", "delete_selected"}
        return set()

    list_display = ("name", "email", "subject", "handled", "created_at")
    list_filter = ("subject", "handled", "created_at")
    search_fields = ("name", "email", "message")
    readonly_fields = ("created_at",)
    date_hierarchy = "created_at"
    actions = ("mark_as_handled", "mark_as_unhandled")
    
    fieldsets = (
        ("Contact Information", {
            "fields": ("name", "email", "phone")
        }),
        ("Message", {
            "fields": ("subject", "message")
        }),
        ("Status", {
            "fields": ("handled", "created_at")
        }),
    )
    
    @admin.action(description="Mark selected messages as handled")
    def mark_as_handled(self, request, queryset):
        updated = queryset.update(handled=True)
        self.message_user(request, f"Marked {updated} message(s) as handled.", level=messages.SUCCESS)
    
    @admin.action(description="Mark selected messages as unhandled")
    def mark_as_unhandled(self, request, queryset):
        updated = queryset.update(handled=False)
        self.message_user(request, f"Marked {updated} message(s) as unhandled.", level=messages.SUCCESS)


@admin.register(StorySeries)
class StorySeriesAdmin(FilterActionsMixin, MediaPreviewMixin, StorywriterPermissionMixin, admin.ModelAdmin):
    def allowed_action_names(self, request):
        if is_editor(request.user) or is_storywriter(request.user):
            return {"delete_selected"}
        return set()

    form = StorySeriesAdminForm
    preview_upload_field = "cover_image"
    preview_external_field = "cover_image_url"
    list_display = ("title", "author", "genre", "status", "total_episodes", "is_featured", "published_at")
    list_filter = ("genre", "status", "is_featured", "published_at")
    search_fields = ("title", "subtitle", "description", "slug")
    readonly_fields = ("slug", "total_episodes", "created_at", "updated_at", "media_preview")
    date_hierarchy = "published_at"

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        if is_editor(request.user):
            return qs
        return qs.filter(author=request.user)

    def get_readonly_fields(self, request, obj=None):
        ro = list(self.readonly_fields)
        if not request.user.is_superuser:
            ro.append("author")
        return ro

    def save_model(self, request, obj, form, change):
        if not change and not request.user.is_superuser:
            obj.author = request.user
        super().save_model(request, obj, form, change)

    def get_fieldsets(self, request, obj=None):
        if is_editor(request.user):
            author_fields = ("title", "slug", "subtitle", "description", "author")
        else:
            author_fields = ("title", "slug", "subtitle", "description")
        return (
            ("Story Information", {
                "fields": author_fields,
                "description": "Slug is auto-generated from the title."
            }),
            ("Story Details", {"fields": ("genre", "status", "is_featured")}),
            ("Images", {
                "fields": ("media_preview", "cover_image", "cover_image_url"),
                "description": "Upload takes priority over external URL.",
            }),
            ("SEO/Social", {
                "fields": ("meta_title", "meta_description", "social_snippet"),
                "description": "Leave empty to auto-generate: meta_title→series title, meta_description→description, social_snippet→subtitle."
            }),
            ("Publishing", {"fields": ("published_at", "total_episodes")}),
            ("Tracking", {"fields": ("created_at", "updated_at"), "classes": ("collapse",)}),
        )



@admin.register(StoryEpisode)
class StoryEpisodeAdmin(FilterActionsMixin, MediaPreviewMixin, StorywriterPermissionMixin, admin.ModelAdmin):
    def allowed_action_names(self, request):
        if is_editor(request.user) or is_storywriter(request.user):
            return {"delete_selected"}
        return set()

    change_form_template = "admin/news/storyepisode/change_form.html"
    form = StoryEpisodeAdminForm

    list_display = ("series", "episode_number", "title", "status", "published_at", "read_time_minutes", "views_total")
    list_filter = ("status", "published_at", "series")
    search_fields = ("title", "content", "excerpt", "slug")
    readonly_fields = ("slug", "created_at", "updated_at")

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        if is_editor(request.user):
            return qs
        return qs.filter(series__author=request.user)

    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == "series" and not request.user.is_superuser:
            kwargs["queryset"] = StorySeries.objects.filter(author=request.user)
        return super().formfield_for_foreignkey(db_field, request, **kwargs)
    date_hierarchy = "published_at"

    fieldsets = (
        ("Episode Information", {
            "fields": ("series", "episode_number", "title", "slug"),
            "description": "Slug is auto-generated from series slug and episode number."
        }),
        ("Content", {
            "fields": ("content", "excerpt", "read_time_minutes")
        }),
        ("Images", {
            "fields": ("media_preview", "image", "image_url", "image_attribution"),
            "description": "Upload takes priority over external URL. Files are stored on the server media disk. Attribution is shown as photo credit.",
        }),
        ("Publishing", {
            "fields": ("status", "published_at", "scheduled_publish_at")
        }),
        ("Next Episode Teaser", {
            "fields": ("next_episode_teaser",),
            "description": "Add a hook to entice readers to come back for the next episode!",
            "classes": ("collapse",),
        }),
        ("SEO", {
            "fields": ("meta_title", "meta_description", "meta_keywords"),
            "description": "Leave empty to auto-generate: meta_title→episode title, meta_description→excerpt, meta_keywords→series genre.",
            "classes": ("collapse",),
        }),
        ("Tracking", {
            "fields": ("created_at", "updated_at"),
            "classes": ("collapse",),
        }),
    )

@admin.register(StoryEpisodeComment)
class StoryEpisodeCommentAdmin(FilterActionsMixin, admin.ModelAdmin):
    def allowed_action_names(self, request):
        if is_editor(request.user):
            return {"approve_comments", "reject_comments", "delete_selected"}
        if is_storywriter(request.user):
            return {"approve_comments", "reject_comments"}
        return set()

    list_display = ("name", "episode", "is_approved", "created_at")
    list_filter = ("is_approved", "created_at")
    search_fields = ("name", "content", "episode__title")
    actions = ["approve_comments", "reject_comments"]

    @admin.action(description="Approve selected comments")
    def approve_comments(self, request, queryset):
        queryset.update(is_approved=True)
        self.message_user(request, f"Approved {queryset.count()} comment(s).")

    @admin.action(description="Reject selected comments")
    def reject_comments(self, request, queryset):
        queryset.update(is_approved=False)
        self.message_user(request, f"Rejected {queryset.count()} comment(s).")


@admin.register(StoryViewEvent)
class StoryViewEventAdmin(NoActionsMixin, admin.ModelAdmin):
    list_display = ("episode", "visitor_key", "ip_address", "created_at")
    list_filter = ("created_at",)
    search_fields = ("episode__title", "visitor_key", "ip_address")
    date_hierarchy = "created_at"
    readonly_fields = ("episode", "visitor_key", "ip_address", "user_agent", "created_at")

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False


@admin.register(StoryVisitorDay)
class StoryVisitorDayAdmin(NoActionsMixin, admin.ModelAdmin):
    list_display = ("episode", "day", "visitor_key", "ip_address")
    list_filter = ("day",)
    search_fields = ("episode__title", "visitor_key", "ip_address")
    readonly_fields = ("episode", "day", "visitor_key", "ip_address")

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False


@admin.register(StoryEpisodeLike)
class StoryEpisodeLikeAdmin(NoActionsMixin, admin.ModelAdmin):
    list_display = ("episode", "visitor_key", "ip_address", "created_at")
    list_filter = ("created_at",)

    def has_add_permission(self, request):
        # User-generated data - no admin additions
        return False

    def has_change_permission(self, request, obj=None):
        # User-generated data - no admin changes
        return False


@admin.register(StoryShare)
class StoryShareAdmin(NoActionsMixin, admin.ModelAdmin):
    list_display = ("platform", "episode", "series", "created_at")
    list_filter = ("platform", "created_at")

    def has_add_permission(self, request):
        # User-generated data - no admin additions
        return False

    def has_change_permission(self, request, obj=None):
        # User-generated data - no admin changes
        return False

