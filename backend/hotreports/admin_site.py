from django.contrib.admin import AdminSite
from django.contrib.auth.models import Group
from django.db.models import Count
from django.utils import timezone

from news.models import (
    Article,
    Category,
    ContactMessage,
    NewsletterSubscriber,
    StorySeries,
    StoryEpisode,
    StoryEpisodeComment,
)
from tourism.models import TourismListing


class HotReportsAdminSite(AdminSite):
    site_header = "The Hot Reports"
    site_title = "The Hot Reports Admin"
    index_title = "Dashboard"
    index_template = "admin/hotreports_index.html"

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
        """Organize apps for superadmin: Content → Users → System."""
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
        """Editor sees news, stories, tourism, and users."""
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
        """Ads manager sees ads, tourism listings, and contact messages."""
        allowed_apps = {'ads', 'tourism', 'news'}
        allowed_models = {
            'ads': ['adslot', 'ad', 'adevent'],
            'tourism': ['tourismlisting'],
            'news': ['contactmessage'],
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
        """Storywriter sees series, episodes, and comments."""
        allowed_apps = {'news'}
        allowed_models = {
            'news': [
                'storyseries', 'storyepisode', 'storyepisodecomment',
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
        
        ctx["hotreports_role"] = (
            "superadmin" if is_super
            else "editor" if is_editor
            else "reporter" if is_reporter
            else "ads" if is_ads
            else "storywriter" if is_storywriter
            else ""
        )
        
        # Role-specific quick links
        if is_super:
            ctx["hotreports_links"] = [
                ("API Docs", "/api/docs/"),
                ("View Site", "/"),
            ]
        elif is_editor:
            ctx["hotreports_links"] = [
                ("Pending Review", "/admin/news/article/?status__exact=pending"),
                ("Stories", "/admin/news/storyseries/"),
                ("View Site", "/"),
            ]
        elif is_reporter:
            ctx["hotreports_links"] = [
                ("My Drafts", "/admin/news/article/?status__exact=draft"),
                ("View Site", "/"),
            ]
        elif is_ads:
            ctx["hotreports_links"] = [
                ("Active Ads", "/admin/ads/ad/?is_active__exact=1"),
                ("View Site", "/"),
            ]
        elif is_storywriter:
            ctx["hotreports_links"] = [
                ("My Series", "/admin/news/storyseries/"),
                ("My Episodes", "/admin/news/storyepisode/"),
                ("Comments", "/admin/news/storyepisodecomment/"),
                ("View Site", "/stories/"),
            ]
        else:
            ctx["hotreports_links"] = [("View Site", "/")]
        
        return ctx

    def index(self, request, extra_context=None):
        from django.contrib.auth import get_user_model

        User = get_user_model()
        now = timezone.now()
        since_7d = now - timezone.timedelta(days=7)

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

        top_categories = (
            Category.objects.annotate(article_count=Count("articles"))
            .order_by("-article_count", "name")[:6]
        )
        recent_articles = Article.objects.order_by("-published_at")[:8]
        recent_messages = ContactMessage.objects.order_by("-created_at")[:8]

        story_stats = {
            "series_total": StorySeries.objects.count(),
            "episodes_total": StoryEpisode.objects.count(),
            "series_ongoing": StorySeries.objects.filter(status=StorySeries.Status.ONGOING).count(),
            "episodes_published": StoryEpisode.objects.filter(status=StoryEpisode.Status.PUBLISHED).count(),
        }

        if is_storywriter and user.is_authenticated:
            my_series = StorySeries.objects.filter(author=user)
            story_stats["my_series_total"] = my_series.count()
            story_stats["my_series_ongoing"] = my_series.filter(status=StorySeries.Status.ONGOING).count()
            story_stats["pending_comments"] = StoryEpisodeComment.objects.filter(
                episode__series__author=user, is_approved=False
            ).count()

        hotreports_role = (
            "superadmin" if is_super
            else "editor" if is_editor
            else "reporter" if is_reporter
            else "ads" if is_ads
            else "storywriter" if is_storywriter
            else ""
        )

        extra = {
            "hotreports_role": hotreports_role,
            "hotreports_stats": stats,
            "hotreports_editorial": editorial,
            "hotreports_stories": story_stats,
            "hotreports_story_stats": story_stats,
            "hotreports_flags": {
                "is_superadmin": is_super,
                "is_editor": is_editor,
                "is_reporter": is_reporter,
            },
            "hotreports_top_categories": top_categories,
            "hotreports_recent_articles": recent_articles,
            "hotreports_recent_messages": recent_messages,
        }
        if extra_context:
            extra.update(extra_context)
        return super().index(request, extra_context=extra)


hotreports_admin_site = HotReportsAdminSite(name="hotreports_admin")
