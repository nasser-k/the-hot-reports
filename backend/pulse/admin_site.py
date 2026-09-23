from django.contrib.admin import AdminSite
from django.contrib.auth.models import Group
from django.db.models import Avg, Count, Q, Sum
from django.utils import timezone

from ads.models import (
    AdSlot,
    Ad,
    AdEvent,
)
from news.models import (
    Article,
    ArticleVisitorDay,
    ArticleViewEvent,
    Category,
    ContactMessage,
    NewsletterSubscriber,
    # Stories models
    StorySeries,
    StoryEpisode,
    StoryEpisodeLike,
    StoryEpisodeComment,
    StoryShare,
    StoryViewEvent,
)
from pulse import admin_charts as charts
from tourism.models import TourismListing


class PulseAdminSite(AdminSite):
    site_header = "Pulse of Kigezi"
    site_title = "PoKi Admin"
    index_title = "Dashboard"
    index_template = "admin/pulse_index.html"

    def get_app_list(self, request, app_label=None):
        """Customize app list based on user role."""
        app_list = super().get_app_list(request, app_label)
        user = request.user
        
        # Determine user role
        is_super = user.is_superuser
        is_editor = user.groups.filter(name="Editor").exists()
        is_reporter = user.groups.filter(name="Reporter").exists()
        is_ads = user.groups.filter(name="Ads Manager").exists()
        is_storywriter = user.groups.filter(name="storywriter").exists()
        
        # Role-based model visibility
        if is_super:
            # Superadmin sees everything, but organized better
            return self._organize_superadmin_apps(app_list)
        elif is_editor:
            return self._organize_editor_apps(app_list)
        elif is_reporter:
            return self._organize_reporter_apps(app_list)
        elif is_ads:
            return self._organize_ads_apps(app_list)
        elif is_storywriter:
            return self._organize_storywriter_apps(app_list)
        
        return app_list
    
    def _organize_superadmin_apps(self, app_list):
        """Organize apps for superadmin: Content → Ads → Users → System."""
        ordered = []
        app_order = ['news', 'tourism', 'ads', 'accounts', 'auth', 'admin']
        
        for app_label in app_order:
            for app in app_list:
                if app.get('app_label') == app_label:
                    ordered.append(app)
                    break
        
        # Add any remaining apps
        for app in app_list:
            if app not in ordered:
                ordered.append(app)
        
        return ordered
    
    def _organize_editor_apps(self, app_list):
        """Editor sees: News management, Stories (view/delete only), Tourism, Users, Analytics."""
        allowed_apps = {'news', 'tourism', 'accounts'}
        allowed_models = {
            'news': [
                'article', 'category', 'tag', 'author',
                'contactmessage', 'newslettersubscriber', 'pushsubscription',
                # Stories - editors can view/delete but not create/edit (storywriters only)
                'storyseries', 'storyepisode', 'storyepisodecomment',
            ],
            'tourism': ['tourismlisting'],
            'accounts': ['user', 'group'],
        }
        
        filtered = []
        for app in app_list:
            app_label = app.get('app_label')
            if app_label in allowed_apps:
                # Filter models within the app
                if app_label in allowed_models:
                    app['models'] = [
                        m for m in app.get('models', [])
                        if m.get('object_name', '').lower() in allowed_models[app_label]
                    ]
                if app.get('models'):  # Only add if has models
                    filtered.append(app)
        
        return filtered
    
    def _organize_reporter_apps(self, app_list):
        """Reporter sees: Articles, Tags, Authors only."""
        allowed_models = {'article', 'tag', 'author'}
        
        filtered = []
        for app in app_list:
            if app.get('app_label') == 'news':
                app['models'] = [
                    m for m in app.get('models', [])
                    if m.get('object_name', '').lower() in allowed_models
                ]
                if app.get('models'):
                    filtered.append(app)
                break
        
        return filtered
    
    def _organize_ads_apps(self, app_list):
        """Ads manager sees: Ads system, Tourism, Contact messages."""
        allowed_apps = {'ads', 'tourism', 'news'}
        allowed_models = {
            'ads': ['adslot', 'ad', 'adevent'],
            'tourism': ['tourismlisting'],
            'news': ['contactmessage'],  # Only contact messages for ad inquiries
        }
        
        filtered = []
        for app in app_list:
            app_label = app.get('app_label')
            if app_label in allowed_apps:
                if app_label in allowed_models:
                    app['models'] = [
                        m for m in app.get('models', [])
                        if m.get('object_name', '').lower() in allowed_models[app_label]
                    ]
                if app.get('models'):
                    filtered.append(app)
        
        return filtered

    def _organize_storywriter_apps(self, app_list):
        """Storywriter sees: Stories management (series, episodes, comments), own analytics."""
        allowed_apps = {'news'}
        allowed_models = {
            'news': [
                'storyseries', 'storyepisode', 'storyepisodecomment',
                'storyepisodeimage', 'storyshare', 'storyviewevent',
            ],
        }
        
        filtered = []
        for app in app_list:
            app_label = app.get('app_label')
            if app_label in allowed_apps:
                # Filter models within the app
                if app_label in allowed_models:
                    app['models'] = [
                        m for m in app.get('models', [])
                        if m.get('object_name', '').lower() in allowed_models[app_label]
                    ]
                if app.get('models'):  # Only add if has models
                    filtered.append(app)
        
        return filtered

    def each_context(self, request):
        ctx = super().each_context(request)
        user = request.user
        
        # Determine role
        is_super = user.is_superuser
        is_editor = user.groups.filter(name="Editor").exists()
        is_reporter = user.groups.filter(name="Reporter").exists()
        is_ads = user.groups.filter(name="Ads Manager").exists()
        is_storywriter = user.groups.filter(name="storywriter").exists()
        
        ctx["pulse_role"] = (
            "superadmin" if is_super
            else "editor" if is_editor
            else "reporter" if is_reporter
            else "ads" if is_ads
            else "storywriter" if is_storywriter
            else ""
        )
        
        # Role-specific quick links
        if is_super:
            ctx["pulse_links"] = [
                ("API Docs", "/api/docs/"),
                ("View Site", "/"),
            ]
        elif is_editor:
            ctx["pulse_links"] = [
                ("Pending Review", "/admin/news/article/?status__exact=pending"),
                ("Stories", "/admin/news/storyseries/"),
                ("View Site", "/"),
            ]
        elif is_reporter:
            ctx["pulse_links"] = [
                ("My Drafts", "/admin/news/article/?status__exact=draft"),
                ("View Site", "/"),
            ]
        elif is_ads:
            ctx["pulse_links"] = [
                ("Active Ads", "/admin/ads/ad/?is_active__exact=1"),
                ("View Site", "/"),
            ]
        elif is_storywriter:
            ctx["pulse_links"] = [
                ("My Series", "/admin/news/storyseries/"),
                ("My Episodes", "/admin/news/storyepisode/"),
                ("Comments", "/admin/news/storyepisodecomment/"),
                ("View Site", "/stories/"),
            ]
        else:
            ctx["pulse_links"] = [("View Site", "/")]
        
        return ctx

    def index(self, request, extra_context=None):
        from django.contrib.auth import get_user_model

        User = get_user_model()
        now = timezone.now()
        since_7d = now - timezone.timedelta(days=7)
        since_30d = now - timezone.timedelta(days=30)
        since_30d_date = (now - timezone.timedelta(days=30)).date()

        user = request.user
        is_super = user.is_superuser
        is_editor = user.groups.filter(name="Editor").exists()
        is_reporter = user.groups.filter(name="Reporter").exists()
        is_ads = user.groups.filter(name="Ads Manager").exists()
        is_storywriter = user.groups.filter(name="storywriter").exists()

        stats = {
            "articles": Article.objects.count(),
            "categories": Category.objects.count(),
            "tourism": TourismListing.objects.count(),
            "newsletter": NewsletterSubscriber.objects.count(),
            "contact": ContactMessage.objects.count(),
            "articles_7d": Article.objects.filter(published_at__gte=since_7d).count(),
            "contact_7d": ContactMessage.objects.filter(created_at__gte=since_7d).count(),
            "views_total": int(Article.objects.aggregate(v=Sum("views_total"))["v"] or 0),
            "raw_views_30d": ArticleViewEvent.objects.filter(created_at__gte=since_30d).count(),
            "ads_active": Ad.objects.filter(is_active=True).count(),
            "ads_total": Ad.objects.count(),
            "ad_events_30d": AdEvent.objects.filter(created_at__gte=since_30d).count(),
        }
        if is_super:
            stats["users"] = User.objects.count()
            stats["groups"] = Group.objects.count()
        else:
            stats["users"] = None
            stats["groups"] = None

        editorial = {
            "pending": Article.objects.filter(status=Article.Status.PENDING).count(),
            "scheduled": Article.objects.filter(scheduled_publish_at__isnull=False).count(),
            "drafts": Article.objects.filter(status=Article.Status.DRAFT).count(),
            "rejected": Article.objects.filter(status=Article.Status.REJECTED).count(),
            "my_drafts": Article.objects.filter(status=Article.Status.DRAFT, created_by=user).count()
            if user.is_authenticated
            else 0,
            "my_pending": Article.objects.filter(status=Article.Status.PENDING, created_by=user).count()
            if user.is_authenticated
            else 0,
        }

        ads_stats = {
            "ad_inquiries_open": ContactMessage.objects.filter(
                subject="advertising", handled=False
            ).count(),
            "ad_inquiries_7d": ContactMessage.objects.filter(
                subject="advertising", created_at__gte=since_7d
            ).count(),
            "ads_active": stats["ads_active"],
            "ads_total": stats["ads_total"],
            "ad_events_30d": stats["ad_events_30d"],
        }

        top_categories = (
            Category.objects.annotate(article_count=Count("articles"))
            .order_by("-article_count", "name")[:6]
        )
        recent_articles = Article.objects.order_by("-published_at")[:8]
        recent_messages = ContactMessage.objects.order_by("-created_at")[:8]

        most_read_all_time = Article.objects.order_by("-views_total", "-published_at")[:8]
        most_read_7d = (
            Article.objects.annotate(
                views_7d=Count("view_events", filter=Q(view_events__created_at__gte=since_7d))
            )
            .order_by("-views_7d", "-published_at")[:8]
        )

        pulse_most_read_max = max((a.views_total for a in most_read_all_time), default=1) or 1

        # Stories stats
        story_stats = {
            "series_total": StorySeries.objects.count(),
            "episodes_total": StoryEpisode.objects.count(),
            "series_ongoing": StorySeries.objects.filter(status=StorySeries.Status.ONGOING).count(),
            "episodes_published": StoryEpisode.objects.filter(status=StoryEpisode.Status.PUBLISHED).count(),
            "total_views": StoryViewEvent.objects.count(),
            "views_30d": StoryViewEvent.objects.filter(created_at__gte=since_30d).count(),
            "total_likes": StoryEpisodeLike.objects.count(),
            "total_comments": StoryEpisodeComment.objects.filter(is_approved=True).count(),
            "total_shares": StoryShare.objects.count(),
        }

        # Storywriter-scoped stats (for storywriter dashboard)
        if is_storywriter and user.is_authenticated:
            my_series = StorySeries.objects.filter(author=user)
            my_episodes = StoryEpisode.objects.filter(series__author=user)
            story_stats["my_series_total"] = my_series.count()
            story_stats["my_episodes_total"] = my_episodes.count()
            story_stats["my_series_ongoing"] = my_series.filter(status=StorySeries.Status.ONGOING).count()
            story_stats["my_episodes_published"] = my_episodes.filter(status=StoryEpisode.Status.PUBLISHED).count()
            story_stats["my_views_total"] = StoryViewEvent.objects.filter(episode__series__author=user).count()
            story_stats["my_likes_total"] = StoryEpisodeLike.objects.filter(episode__series__author=user).count()
            story_stats["my_comments_total"] = StoryEpisodeComment.objects.filter(episode__series__author=user, is_approved=True).count()
            story_stats["my_shares_total"] = StoryShare.objects.filter(episode__series__author=user).count()
            story_stats["pending_comments"] = StoryEpisodeComment.objects.filter(episode__series__author=user, is_approved=False).count()

        # Analytics series (scoped for reporters)
        view_event_qs = ArticleViewEvent.objects.all()
        visitor_day_qs = ArticleVisitorDay.objects.all()
        article_scope = Article.objects.all()
        if is_reporter and user.is_authenticated:
            view_event_qs = view_event_qs.filter(article__created_by=user)
            visitor_day_qs = visitor_day_qs.filter(article__created_by=user)
            article_scope = article_scope.filter(created_by=user)

        pulse_views_per_day = charts.daily_counts_for_model(qs=view_event_qs, days=30)
        pulse_uniques_per_day = charts.daily_counts_by_day_field(qs=visitor_day_qs, days=30)

        pulse_completion_donut = []

        top_performers = article_scope.annotate(
            score=Count("visitor_days", filter=Q(visitor_days__day__gte=since_30d_date))
        ).order_by("-score", "-published_at")[:10]

        # Determine role string for template
        pulse_role = (
            "superadmin" if is_super
            else "editor" if is_editor
            else "reporter" if is_reporter
            else "ads" if is_ads
            else "storywriter" if is_storywriter
            else ""
        )

        extra = {
            "pulse_role": pulse_role,
            "pulse_stats": stats,
            "pulse_editorial": editorial,
            "pulse_ads": ads_stats,
            "pulse_stories": story_stats,
            "pulse_story_stats": story_stats,
            "pulse_flags": {
                "is_superadmin": is_super,
                "is_editor": is_editor,
                "is_reporter": is_reporter,
                "is_ads": is_ads,
            },
            "pulse_top_categories": top_categories,
            "pulse_recent_articles": recent_articles,
            "pulse_recent_messages": recent_messages,
            "pulse_most_read_all_time": most_read_all_time,
            "pulse_most_read_7d": most_read_7d,
            "pulse_most_read_max": pulse_most_read_max,
            "pulse_views_per_day": pulse_views_per_day,
            "pulse_uniques_per_day": pulse_uniques_per_day,
            "pulse_completion_per_day": [],
            "pulse_completion_donut": pulse_completion_donut,
            "pulse_top_performers": top_performers,
            "pulse_show_charts": is_super or is_editor,
        }
        if extra_context:
            extra.update(extra_context)
        return super().index(request, extra_context=extra)


pulse_admin_site = PulseAdminSite(name="pulse_admin")
