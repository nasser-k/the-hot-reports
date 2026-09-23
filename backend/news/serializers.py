from datetime import date

from rest_framework import serializers
from pulse.media_urls import default_avatar_url, resolve_media_image

from news.analytics_utils import visitor_key_from_request
from .models import (
    Article,
    Category,
    ContactMessage,
    StoryEpisode,
    StoryEpisodeComment,
    StorySeries,
)


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ("name", "slug", "color")


class ArticleListSerializer(serializers.ModelSerializer):
    id = serializers.SerializerMethodField()
    category = CategorySerializer(read_only=True)
    author = serializers.SerializerMethodField()
    image = serializers.SerializerMethodField()
    imageAttribution = serializers.CharField(source="image_attribution", read_only=True)
    tags = serializers.SerializerMethodField()
    publishedAt = serializers.DateTimeField(source="published_at", read_only=True)
    readTime = serializers.IntegerField(source="read_time", read_only=True)
    metaTitle = serializers.SerializerMethodField()
    metaDescription = serializers.SerializerMethodField()
    metaKeywords = serializers.SerializerMethodField()

    class Meta:
        model = Article
        fields = (
            "id",
            "slug",
            "title",
            "excerpt",
            "category",
            "author",
            "image",
            "imageAttribution",
            "publishedAt",
            "readTime",
            "highlight",
            "tags",
            "metaTitle",
            "metaDescription",
            "metaKeywords",
        )

    def get_id(self, obj: Article) -> str:
        return str(obj.pk)

    def get_author(self, obj: Article) -> dict:
        author = obj.author
        request = self.context.get("request")
        try:
            avatar = author.get_avatar_url(request)
        except Exception:
            avatar = default_avatar_url(request=request)

        return {
            "name": author.full_name or author.email,
            "avatar": avatar or default_avatar_url(request=request)
        }

    def get_image(self, obj: Article) -> str:
        return resolve_media_image(
            file_field=getattr(obj, "image", None),
            external_url=obj.image_url,
            request=self.context.get("request"),
        )

    def get_tags(self, obj: Article) -> list[str]:
        return [t.name for t in obj.tags.all()]

    def get_metaTitle(self, obj: Article) -> str:
        return obj.meta_title or obj.title

    def get_metaDescription(self, obj: Article) -> str:
        return obj.meta_description or obj.excerpt or ""

    def get_metaKeywords(self, obj: Article) -> str:
        return obj.meta_keywords or ""


class ArticleDetailSerializer(ArticleListSerializer):
    class Meta(ArticleListSerializer.Meta):
        fields = ArticleListSerializer.Meta.fields + ("content",)


class NewsletterSubscribeSerializer(serializers.Serializer):
    """Plain serializer so duplicate emails do not fail unique validation before get_or_create."""

    email = serializers.EmailField()


class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = ("name", "email", "subject", "phone", "message")

    def validate_subject(self, value: str) -> str:
        valid = {c[0] for c in ContactMessage.SUBJECT_CHOICES}
        if value not in valid:
            raise serializers.ValidationError("Invalid subject choice.")
        return value


class StoryAuthorSerializer(serializers.Serializer):
    """Minimal author info for story series."""
    name = serializers.CharField()
    slug = serializers.CharField()
    avatar = serializers.CharField()
    bio = serializers.CharField(required=False, allow_blank=True)


class StoryEpisodeListSerializer(serializers.ModelSerializer):
    """Episode list items in series detail."""
    id = serializers.SerializerMethodField()
    publishedAt = serializers.DateTimeField(source="published_at", read_only=True)
    readTimeMinutes = serializers.IntegerField(source="read_time_minutes", read_only=True)
    viewsTotal = serializers.IntegerField(source="views_total", read_only=True)
    likesCount = serializers.SerializerMethodField()
    commentsCount = serializers.SerializerMethodField()
    image = serializers.SerializerMethodField()
    imageAttribution = serializers.CharField(source="image_attribution", read_only=True)
    metaTitle = serializers.SerializerMethodField()
    metaDescription = serializers.SerializerMethodField()
    metaKeywords = serializers.SerializerMethodField()

    class Meta:
        model = StoryEpisode
        fields = (
            "id",
            "slug",
            "episode_number",
            "title",
            "excerpt",
            "publishedAt",
            "readTimeMinutes",
            "viewsTotal",
            "likesCount",
            "commentsCount",
            "image",
            "imageAttribution",
            "metaTitle",
            "metaDescription",
            "metaKeywords",
        )

    def get_id(self, obj: StoryEpisode) -> str:
        return str(obj.pk)

    def get_likesCount(self, obj: StoryEpisode) -> int:
        return obj.likes.count()

    def get_commentsCount(self, obj: StoryEpisode) -> int:
        return obj.comments.filter(is_approved=True).count()

    def get_image(self, obj: StoryEpisode) -> str | None:
        return resolve_media_image(
            file_field=getattr(obj, "image", None),
            external_url=obj.image_url,
            request=self.context.get("request"),
            allow_none=True,
        )

    def get_metaTitle(self, obj: StoryEpisode) -> str:
        return obj.meta_title or obj.title

    def get_metaDescription(self, obj: StoryEpisode) -> str:
        return obj.meta_description or obj.excerpt or ""

    def get_metaKeywords(self, obj: StoryEpisode) -> str:
        return obj.meta_keywords or ""


class StorySeriesListSerializer(serializers.ModelSerializer):
    """Serializer for story series listing page."""
    id = serializers.SerializerMethodField()
    author = serializers.SerializerMethodField()
    coverImage = serializers.SerializerMethodField()
    totalEpisodes = serializers.IntegerField(source="total_episodes", read_only=True)
    publishedAt = serializers.DateTimeField(source="published_at", read_only=True)
    socialSnippet = serializers.SerializerMethodField()
    viewsTotal = serializers.IntegerField(source="views_total", read_only=True)
    isFeatured = serializers.BooleanField(source="is_featured", read_only=True)
    metaTitle = serializers.SerializerMethodField()
    metaDescription = serializers.SerializerMethodField()

    class Meta:
        model = StorySeries
        fields = (
            "id",
            "slug",
            "title",
            "subtitle",
            "description",
            "author",
            "genre",
            "coverImage",
            "status",
            "totalEpisodes",
            "publishedAt",
            "socialSnippet",
            "viewsTotal",
            "isFeatured",
            "metaTitle",
            "metaDescription",
        )

    def get_id(self, obj: StorySeries) -> str:
        return str(obj.pk)

    def get_author(self, obj: StorySeries) -> dict:
        if not obj.author:
            return {
                "name": "Pulse Writer",
                "slug": "",
                "avatar": default_avatar_url(request=self.context.get("request")),
                "bio": "",
            }
        request = self.context.get("request")
        try:
            avatar = obj.author.get_avatar_url(request)
        except Exception:
            avatar = default_avatar_url(request=request)
        return {
            "name": getattr(obj.author, "full_name", None) or getattr(obj.author, "email", "Pulse Writer"),
            "slug": getattr(obj.author, "slug", "") if hasattr(obj.author, "slug") else str(obj.author.pk),
            "avatar": avatar or default_avatar_url(request=request),
            "bio": getattr(obj.author, "bio", "") or "",
        }

    def get_coverImage(self, obj: StorySeries) -> str | None:
        return resolve_media_image(
            file_field=getattr(obj, "cover_image", None),
            external_url=obj.cover_image_url,
            request=self.context.get("request"),
            allow_none=True,
        )

    def get_socialSnippet(self, obj: StorySeries) -> str:
        return obj.social_snippet or obj.subtitle or obj.description or ""

    def get_metaTitle(self, obj: StorySeries) -> str:
        return obj.meta_title or obj.title

    def get_metaDescription(self, obj: StorySeries) -> str:
        return obj.meta_description or obj.subtitle or obj.description or ""


class StorySeriesDetailSerializer(StorySeriesListSerializer):
    """Full series details with episode list."""
    episodes = serializers.SerializerMethodField()
    metaTitle = serializers.SerializerMethodField()
    metaDescription = serializers.SerializerMethodField()

    class Meta(StorySeriesListSerializer.Meta):
        fields = StorySeriesListSerializer.Meta.fields + ("episodes", "metaTitle", "metaDescription")

    def get_metaTitle(self, obj: StorySeries) -> str:
        return obj.meta_title or obj.title

    def get_metaDescription(self, obj: StorySeries) -> str:
        return obj.meta_description or obj.subtitle or obj.description or ""

    def get_episodes(self, obj: StorySeries) -> list:
        # Only include published episodes for public API
        episodes = obj.episodes.filter(status=StoryEpisode.Status.PUBLISHED)
        return StoryEpisodeListSerializer(episodes, many=True, context=self.context).data


class StoryCommentSerializer(serializers.ModelSerializer):
    """Serializer for episode comments."""
    id = serializers.SerializerMethodField()
    createdAt = serializers.DateTimeField(source="created_at", read_only=True)
    replies = serializers.SerializerMethodField()

    class Meta:
        model = StoryEpisodeComment
        fields = ("id", "name", "content", "createdAt", "replies")

    def get_id(self, obj: StoryEpisodeComment) -> str:
        return str(obj.pk)

    def get_replies(self, obj: StoryEpisodeComment) -> list:
        if obj.replies.exists():
            replies = obj.replies.filter(is_approved=True)
            return StoryCommentSerializer(replies, many=True, context=self.context).data
        return []


class StoryEpisodeDetailSerializer(serializers.ModelSerializer):
    """Full episode with series info, navigation, images, comments, and engagement."""
    id = serializers.SerializerMethodField()
    series = StorySeriesListSerializer(read_only=True)
    episodeNumber = serializers.IntegerField(source="episode_number", read_only=True)
    publishedAt = serializers.DateTimeField(source="published_at", read_only=True)
    readTimeMinutes = serializers.IntegerField(source="read_time_minutes", read_only=True)
    nextEpisodeTeaser = serializers.CharField(source="next_episode_teaser", read_only=True)
    previousEpisode = serializers.SerializerMethodField()
    nextEpisode = serializers.SerializerMethodField()
    isFirstEpisode = serializers.SerializerMethodField()
    isLastPublishedEpisode = serializers.SerializerMethodField()
    # Image field
    image = serializers.SerializerMethodField()
    imageAttribution = serializers.CharField(source="image_attribution", read_only=True)
    # Metadata fields
    metaTitle = serializers.SerializerMethodField()
    metaDescription = serializers.SerializerMethodField()
    metaKeywords = serializers.SerializerMethodField()
    # Engagement fields
    comments = serializers.SerializerMethodField()
    likesCount = serializers.SerializerMethodField()
    commentsCount = serializers.SerializerMethodField()
    userLiked = serializers.SerializerMethodField()
    viewsTotal = serializers.IntegerField(source="views_total", read_only=True)

    class Meta:
        model = StoryEpisode
        fields = (
            "id",
            "slug",
            "series",
            "episodeNumber",
            "title",
            "excerpt",
            "content",
            "publishedAt",
            "readTimeMinutes",
            "nextEpisodeTeaser",
            "previousEpisode",
            "nextEpisode",
            "isFirstEpisode",
            "isLastPublishedEpisode",
            "image",
            "imageAttribution",
            "metaTitle",
            "metaDescription",
            "metaKeywords",
            "comments",
            "likesCount",
            "commentsCount",
            "userLiked",
            "viewsTotal",
        )

    def get_id(self, obj: StoryEpisode) -> str:
        return str(obj.pk)

    def get_previousEpisode(self, obj: StoryEpisode) -> dict | None:
        prev = obj.get_previous_episode()
        if prev:
            return {
                "id": str(prev.pk),
                "slug": prev.slug,
                "episodeNumber": prev.episode_number,
                "title": prev.title,
            }
        return None

    def get_nextEpisode(self, obj: StoryEpisode) -> dict | None:
        next_ep = obj.get_next_episode()
        if next_ep:
            return {
                "id": str(next_ep.pk),
                "slug": next_ep.slug,
                "episodeNumber": next_ep.episode_number,
                "title": next_ep.title,
            }
        return None

    def get_isFirstEpisode(self, obj: StoryEpisode) -> bool:
        return obj.is_first_episode()

    def get_isLastPublishedEpisode(self, obj: StoryEpisode) -> bool:
        return obj.is_last_published_episode()

    def get_image(self, obj: StoryEpisode) -> str | None:
        return resolve_media_image(
            file_field=getattr(obj, "image", None),
            external_url=obj.image_url,
            request=self.context.get("request"),
            allow_none=True,
        )

    def get_metaTitle(self, obj: StoryEpisode) -> str:
        return obj.meta_title or obj.title

    def get_metaDescription(self, obj: StoryEpisode) -> str:
        return obj.meta_description or obj.excerpt or ""

    def get_metaKeywords(self, obj: StoryEpisode) -> str:
        return obj.meta_keywords or obj.series.genre or ""

    def get_comments(self, obj: StoryEpisode) -> list:
        # Only approved top-level comments (no replies)
        comments = obj.comments.filter(is_approved=True, parent__isnull=True)
        return StoryCommentSerializer(comments, many=True, context=self.context).data

    def get_likesCount(self, obj: StoryEpisode) -> int:
        return obj.likes.count()

    def get_commentsCount(self, obj: StoryEpisode) -> int:
        return obj.comments.filter(is_approved=True).count()

    def get_userLiked(self, obj: StoryEpisode) -> bool:
        request = self.context.get("request")
        if not request:
            return False
        
        visitor_id = request.query_params.get("visitorId") or request.query_params.get("visitor_id")
        visitor_key = visitor_key_from_request(request, visitor_id, day=date.today())
        return obj.likes.filter(visitor_key=visitor_key).exists()


class StoryCommentCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating comments."""
    class Meta:
        model = StoryEpisodeComment
        fields = ("name", "email", "content", "parent")

    def validate_content(self, value: str) -> str:
        if len(value.strip()) < 3:
            raise serializers.ValidationError("Comment must be at least 3 characters.")
        if len(value) > 2000:
            raise serializers.ValidationError("Comment must be under 2000 characters.")
        return value
