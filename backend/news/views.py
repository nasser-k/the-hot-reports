import time

import math
from django.core.cache import cache
from django.db import transaction, OperationalError
from django.db.models import F, Q
from django.shortcuts import get_object_or_404
from django.utils import timezone
from datetime import date
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, generics, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.parsers import JSONParser
from rest_framework.views import APIView

from news.analytics_utils import get_client_ip, visitor_key_from_request
from .filters import ArticleFilter


def _track_content_view(
    request,
    content_obj,
    visitor_day_model,
    view_event_model,
    content_field_name: str,
    views_total_field: str = "views_total",
):
    """
    Consolidated view tracking logic for articles and story episodes.
    Handles duplicate detection, IP-based anti-abuse, and atomic counter updates.
    
    Returns tuple: (is_new_view: bool, visitor_key: str)
    """
    today = date.today()
    visitor_id = request.data.get("visitorId") if request.data else None
    visitor_id = visitor_id or request.data.get("visitor_id") if request.data else None
    visitor_key = visitor_key_from_request(request, visitor_id, day=today)
    client_ip = get_client_ip(request)
    user_agent = request.META.get("HTTP_USER_AGENT", "")[:400]
    
    # Build filter kwargs dynamically
    day_filter = {content_field_name: content_obj, "day": today, "visitor_key": visitor_key}
    ip_filter = {content_field_name: content_obj, "day": today, "ip_address": client_ip}
    
    # Check for existing view by visitor key
    existing_visitor = visitor_day_model.objects.filter(**day_filter).first()
    is_new_view = not existing_visitor
    
    # IP-based anti-abuse check
    if is_new_view and client_ip:
        existing_ip = visitor_day_model.objects.filter(**ip_filter).first()
        if existing_ip:
            is_new_view = False
    
    # Atomic increment and log view event only for NEW views (prevents duplicates)
    if is_new_view:
        max_retries = 3
        for attempt in range(max_retries):
            try:
                with transaction.atomic():
                    visitor_day_model.objects.create(**day_filter, ip_address=client_ip)
                    content_obj.__class__.objects.filter(pk=content_obj.pk).update(
                        **{views_total_field: F(views_total_field) + 1}
                    )
                break
            except OperationalError:
                if attempt < max_retries - 1:
                    time.sleep(0.1 * (attempt + 1))
                # Last attempt failed, continue silently
        
        # Log view event only for new views (best effort, don't fail on error)
        try:
            view_event_model.objects.create(
                **{content_field_name: content_obj},
                visitor_key=visitor_key,
                ip_address=client_ip,
                user_agent=user_agent,
            )
        except Exception:
            pass
    
    return is_new_view, visitor_key
from .models import (
    Article,
    ArticleViewEvent,
    ArticleVisitorDay,
    Category,
    ContactMessage,
    NewsletterSubscriber,
    PushSubscription,
    StoryEpisode,
    StoryEpisodeComment,
    StoryEpisodeLike,
    StorySeries,
    StoryShare,
    StoryViewEvent,
    StoryVisitorDay,
)
from .serializers import (
    ArticleDetailSerializer,
    ArticleListSerializer,
    CategorySerializer,
    ContactMessageSerializer,
    NewsletterSubscribeSerializer,
    StoryCommentCreateSerializer,
    StoryCommentSerializer,
    StoryEpisodeDetailSerializer,
    StoryEpisodeListSerializer,
    StorySeriesDetailSerializer,
    StorySeriesListSerializer,
)


class CategoryListView(generics.ListAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    pagination_class = None


class ArticleViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Article.objects.select_related("category", "author").prefetch_related("tags").all()
    lookup_field = "slug"
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]
    filterset_class = ArticleFilter
    search_fields = ("title", "excerpt", "category__name", "tags__name")
    ordering_fields = ("published_at", "created_at", "title")
    ordering = ("-published_at",)

    def get_queryset(self):
        qs = super().get_queryset()
        # Public API only exposes published articles
        now = timezone.now()
        qs = qs.filter(status=Article.Status.PUBLISHED, published_at__lte=now)
        p = self.request.query_params
        if self.action == "list" and (p.get("search") or p.get("tag")):
            return qs.distinct()
        return qs

    def get_serializer_class(self):
        if self.action == "retrieve":
            return ArticleDetailSerializer
        return ArticleListSerializer

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx["request"] = self.request
        return ctx

    @action(detail=True, methods=["get"], url_path="related")
    def related(self, request, slug=None):
        article = self.get_object()
        try:
            limit = min(int(request.query_params.get("limit", 4)), 20)
        except ValueError:
            limit = 4
        tag_ids = list(article.tags.values_list("pk", flat=True))
        q = Q(category_id=article.category_id)
        if tag_ids:
            q |= Q(tags__in=tag_ids)
        qs = (
            Article.objects.filter(q)
            .exclude(pk=article.pk)
            .select_related("category", "author")
            .prefetch_related("tags")
            .distinct()
            .order_by("-published_at")[:limit]
        )
        ser = ArticleListSerializer(qs, many=True)
        return Response(ser.data)

class ArticleTrackView(APIView):
    permission_classes = []
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "article_view"
    parser_classes = [JSONParser]

    def post(self, request, slug: str, *args, **kwargs):
        now = timezone.now()
        article = get_object_or_404(
            Article,
            slug=slug,
            status=Article.Status.PUBLISHED,
            published_at__lte=now,
        )
        is_new_view, _ = _track_content_view(
            request,
            article,
            ArticleVisitorDay,
            ArticleViewEvent,
            "article",
            "views_total",
        )
        return Response({"ok": True, "uniqueToday": is_new_view})
class NewsletterSubscribeView(generics.GenericAPIView):
    serializer_class = NewsletterSubscribeSerializer
    permission_classes = []
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "newsletter"

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"].lower()
        obj, created = NewsletterSubscriber.objects.get_or_create(
            email=email,
            defaults={"confirmed": False},
        )
        return Response(
            {"email": obj.email, "alreadySubscribed": not created},
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
        )


class ContactCreateView(generics.CreateAPIView):
    queryset = ContactMessage.objects.all()
    serializer_class = ContactMessageSerializer
    permission_classes = []

    def create(self, request, *args, **kwargs):
        # 2-day IP-based rate limit (same as story comments)
        ip = get_client_ip(request)
        rate_key = f"contact_ratelimit_{ip}"
        last_contact_ts = cache.get(rate_key)
        if last_contact_ts:
            elapsed = time.time() - last_contact_ts
            remaining = (2 * 24 * 3600) - elapsed
            hours_left = math.ceil(remaining / 3600)
            return Response(
                {"detail": f"You can submit another contact message in {hours_left} hour{'s' if hours_left != 1 else ''}."},
                status=status.HTTP_429_TOO_MANY_REQUESTS
            )

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)

        # Set 2-day rate limit for this IP
        cache.set(rate_key, time.time(), timeout=2 * 24 * 60 * 60)

        return Response({"success": True}, status=status.HTTP_201_CREATED)


# ============================================
# PUSH NOTIFICATION API
# ============================================

class VapidPublicKeyView(APIView):
    """Get VAPID public key for subscription."""

    permission_classes = []

    def get(self, request):
        from decouple import config
        public_key = config("VAPID_PUBLIC_KEY", default="")
        return Response({"publicKey": public_key})


class SubscribePushView(APIView):
    """Subscribe to push notifications."""

    permission_classes = []

    def post(self, request):
        subscription_data = request.data.get("subscription", {})
        user_agent = request.data.get("userAgent", "")

        endpoint = subscription_data.get("endpoint", "")
        keys = subscription_data.get("keys", {})
        p256dh = keys.get("p256dh", "")
        auth = keys.get("auth", "")

        if not endpoint or not p256dh or not auth:
            return Response(
                {"error": "Invalid subscription data"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Create or update subscription
        obj, created = PushSubscription.objects.update_or_create(
            endpoint=endpoint,
            defaults={
                "p256dh": p256dh,
                "auth": auth,
                "user_agent": user_agent,
                "is_active": True,
            },
        )

        return Response(
            {
                "success": True,
                "subscribed": True,
                "subscriptionId": obj.id,
            },
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
        )


class UnsubscribePushView(APIView):
    """Unsubscribe from push notifications."""

    permission_classes = []

    def post(self, request):
        endpoint = request.data.get("endpoint", "")

        if not endpoint:
            return Response(
                {"error": "Endpoint required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Mark subscription as inactive instead of deleting
        updated = PushSubscription.objects.filter(endpoint=endpoint).update(
            is_active=False
        )

        return Response({
            "success": True,
            "unsubscribed": updated > 0,
        })


# ============================================
# STORY SERIES API
# ============================================

class StorySeriesViewSet(viewsets.ReadOnlyModelViewSet):
    """API endpoint for story series."""
    queryset = StorySeries.objects.select_related("author").prefetch_related("episodes")
    lookup_field = "slug"
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]
    filterset_fields = ["genre", "status", "is_featured"]
    search_fields = ("title", "subtitle", "description")
    ordering_fields = ("published_at", "created_at", "title", "views_total")
    ordering = ("-is_featured", "-published_at")

    def get_queryset(self):
        qs = super().get_queryset()
        # Public API only exposes published/ongoing/completed series
        now = timezone.now()
        qs = qs.filter(
            status__in=[StorySeries.Status.ONGOING, StorySeries.Status.COMPLETED],
            published_at__lte=now
        )
        return qs

    def get_serializer_class(self):
        if self.action == "retrieve":
            return StorySeriesDetailSerializer
        return StorySeriesListSerializer

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx["request"] = self.request
        return ctx

    @action(detail=True, methods=["get"], url_path="episodes")
    def episodes(self, request, slug=None):
        """Get all episodes for a specific series."""
        series = self.get_object()
        episodes = series.episodes.filter(status=StoryEpisode.Status.PUBLISHED)
        serializer = StoryEpisodeListSerializer(
            episodes,
            many=True,
            context=self.get_serializer_context(),
        )
        return Response(serializer.data)

    @action(detail=False, methods=["get"], url_path="genres")
    def genres(self, request):
        """Get list of available story genres."""
        return Response([
            {"value": choice[0], "label": choice[1]}
            for choice in StorySeries.Genre.choices
        ])

    @action(detail=False, methods=["get"], url_path="by-author")
    def by_author(self, request):
        """Get series by author email."""
        author_email = request.query_params.get("author")
        if not author_email:
            return Response(
                {"error": "Author email required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        # Find author by email (User model uses email as username)
        from accounts.models import User
        try:
            author = User.objects.get(email=author_email)
        except User.DoesNotExist:
            return Response(
                {"error": "Author not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        series = self.get_queryset().filter(author=author)
        serializer = StorySeriesListSerializer(
            series,
            many=True,
            context=self.get_serializer_context()
        )
        return Response(serializer.data)


class StoryEpisodeViewSet(viewsets.ReadOnlyModelViewSet):
    """API endpoint for story episodes with comments, likes, and shares."""
    queryset = StoryEpisode.objects.select_related("series", "series__author").prefetch_related("comments", "likes")
    lookup_field = "slug"

    def get_queryset(self):
        qs = super().get_queryset()
        # Public API only exposes published episodes
        now = timezone.now()
        qs = qs.filter(
            status=StoryEpisode.Status.PUBLISHED,
            published_at__lte=now,
            series__status__in=[
                StorySeries.Status.ONGOING,
                StorySeries.Status.COMPLETED
            ]
        )
        return qs

    def get_serializer_class(self):
        if self.action == "retrieve":
            return StoryEpisodeDetailSerializer
        return StoryEpisodeListSerializer

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx["request"] = self.request
        return ctx

    @action(
        detail=True, 
        methods=["post"], 
        url_path="comment"
    )
    def comment(self, request, slug=None):
        """Add a comment to an episode."""
        episode = self.get_object()

        # 2-day IP-based rate limit
        ip = get_client_ip(request)
        rate_key = f"comment_ratelimit_{ip}"
        last_comment_ts = cache.get(rate_key)
        if last_comment_ts:
            elapsed = time.time() - last_comment_ts
            remaining = (2 * 24 * 3600) - elapsed
            hours_left = math.ceil(remaining / 3600)
            return Response(
                {"detail": f"You can submit another comment in {hours_left} hour{'s' if hours_left != 1 else ''}."},
                status=status.HTTP_429_TOO_MANY_REQUESTS
            )

        serializer = StoryCommentCreateSerializer(data=request.data)
        
        if serializer.is_valid():
            comment = StoryEpisodeComment(
                episode=episode,
                name=serializer.validated_data["name"],
                email=serializer.validated_data.get("email", ""),
                content=serializer.validated_data["content"],
                parent=serializer.validated_data.get("parent"),
                ip_address=get_client_ip(request),
                is_approved=False  # Requires admin approval
            )
            comment.save()
            # Set 2-day rate limit for this IP
            cache.set(rate_key, time.time(), timeout=2 * 24 * 60 * 60)

            return Response({
                "success": True,
                "message": "Comment submitted! It will appear after approval.",
                "comment": StoryCommentSerializer(comment, context={"request": request}).data
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=["post"], url_path="like")
    def like(self, request, slug=None):
        """Toggle like on an episode. Prevents duplicate likes from same IP."""
        episode = self.get_object()
        
        # Support visitor ID from frontend for better tracking
        visitor_id = request.data.get("visitorId") if request.data else None
        visitor_id = visitor_id or request.data.get("visitor_id")
        
        visitor_key = visitor_key_from_request(request, visitor_id, day=date.today())
        client_ip = get_client_ip(request)

        # Check for existing like by visitor key
        existing_like = StoryEpisodeLike.objects.filter(
            episode=episode,
            visitor_key=visitor_key,
        ).first()

        # Also check for recent like from same IP (prevent cache-clear abuse)
        # This blocks users who clear localStorage to like again
        if not existing_like and client_ip:
            existing_ip_like = StoryEpisodeLike.objects.filter(
                episode=episode,
                ip_address=client_ip,
            ).exclude(visitor_key__startswith="vid:").first()
            if existing_ip_like:
                existing_like = existing_ip_like

        if existing_like:
            existing_like.delete()
            liked = False
        else:
            user_agent = request.META.get("HTTP_USER_AGENT", "")
            StoryEpisodeLike.objects.create(
                episode=episode,
                visitor_key=visitor_key,
                ip_address=client_ip,
                user_agent=user_agent[:255],
            )
            liked = True

        # Refresh from DB to get accurate count after the change
        likes_count = StoryEpisodeLike.objects.filter(episode=episode).count()

        return Response({
            "liked": liked,
            "likesCount": likes_count
        })

    @action(detail=True, methods=["post"], url_path="share")
    def share(self, request, slug=None):
        """Track a share action. Rate limited to prevent spam."""
        episode = self.get_object()
        platform = request.data.get("platform", "copy")
        
        # Validate platform
        valid_platforms = ["facebook", "whatsapp", "twitter", "copy"]
        if platform not in valid_platforms:
            return Response(
                {"error": f"Invalid platform. Must be one of: {', '.join(valid_platforms)}"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Rate limit: 1 share per episode per IP per hour
        client_ip = get_client_ip(request)
        if client_ip:
            rate_key = f"share_ratelimit_{episode.pk}_{client_ip}"
            last_share_ts = cache.get(rate_key)
            if last_share_ts:
                elapsed = time.time() - last_share_ts
                if elapsed < 3600:  # 1 hour cooldown
                    return Response({
                        "success": True,
                        "message": f"Already shared on {platform} recently."
                    })
        
        # Track the share
        StoryShare.objects.create(
            episode=episode,
            platform=platform,
            ip_address=client_ip,
        )
        
        # Set rate limit
        if client_ip:
            cache.set(rate_key, time.time(), timeout=3600)
        
        return Response({
            "success": True,
            "message": f"Share on {platform} tracked."
        })

    @action(detail=True, methods=["post"], url_path="track-view")
    def track_view(self, request, slug=None):
        """Track a view event for analytics. Prevents duplicate views from same IP."""
        episode = self.get_object()
        is_new_view, _ = _track_content_view(
            request,
            episode,
            StoryVisitorDay,
            StoryViewEvent,
            "episode",
            "views_total",
        )
        if is_new_view:
            episode.refresh_from_db(fields=["views_total"])
        return Response({"success": True, "viewsTotal": episode.views_total})


class SiteSettingsView(APIView):
    """Return site-wide settings for frontend metadata."""
    
    def get(self, request):
        from decouple import config
        settings = {
            "siteName": config("SITE_NAME", default="The Hot Reports"),
            "siteDescription": config(
                "SITE_DESCRIPTION",
                default="Nationwide news, serial stories, and travel reporting from across Uganda.",
            ),
            "siteUrl": config("SITE_URL", default="https://thehotreports.com"),
            "ogImage": config("OG_IMAGE", default="/og-image.png"),
            "twitterHandle": config("TWITTER_HANDLE", default="@thehotreports"),
            "storiesMeta": {
                "title": "Serial Stories",
                "description": "Serial stories from writers across Uganda. Follow each episode as it is published.",
                "keywords": ["serial stories", "Uganda fiction", "narrative journalism", "short stories"],
            },
            "authorsMeta": {
                "title": "Story Writers",
                "description": "Writers publishing serial stories on The Hot Reports.",
                "keywords": ["story writers", "Uganda writers", "serial stories"],
            },
            "articleMeta": {
                "titleTemplate": "{title} | The Hot Reports",
                "description": "Nationwide news from The Hot Reports.",
            },
            "categoryMeta": {
                "titleTemplate": "{category} News | The Hot Reports",
                "description": "Latest {category} news from across Uganda.",
            },
            "tourismMeta": {
                "title": "Tourism & Travel",
                "description": "Safaris, lodges, hotels, and cultural travel across Uganda.",
                "keywords": ["Uganda tourism", "Uganda safaris", "Uganda travel", "lodges", "hotels"],
            },
            "aboutMeta": {
                "title": "About The Hot Reports",
                "description": "The Hot Reports is a nationwide digital newsroom covering Uganda.",
            },
        }
        return Response(settings)
