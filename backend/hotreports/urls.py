from django.contrib import admin
from django.urls import include, path, re_path
from django.views.generic import RedirectView
from django.views.static import serve
from drf_spectacular.views import SpectacularAPIView, SpectacularRedocView, SpectacularSwaggerView
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from django.conf import settings
from django.conf.urls.static import static

from accounts.views import EmailTokenObtainPairView, MeView, PasswordChangeView, RegisterView, TeamMembersView
from news.views import (
    ArticleTrackView,
    ArticleViewSet,
    CategoryListView,
    ContactCreateView,
    NewsletterSubscribeView,
    SiteSettingsView,
    StoryEpisodeViewSet,
    StorySeriesViewSet,
    SubscribePushView,
    UnsubscribePushView,
    VapidPublicKeyView,
)
from tourism.views import TourismViewSet
from hotreports.admin_site import hotreports_admin_site
from news.ckeditor_upload import ckeditor5_image_upload


router = DefaultRouter()
router.register("articles", ArticleViewSet, basename="article")
router.register("stories/series", StorySeriesViewSet, basename="story-series")
router.register("stories/episodes", StoryEpisodeViewSet, basename="story-episode")
router.register("tourism", TourismViewSet, basename="tourism")

api_v1 = [
    path("settings/", SiteSettingsView.as_view(), name="api-settings"),
    path("categories/", CategoryListView.as_view(), name="api-categories"),
    path("team/", TeamMembersView.as_view(), name="api-team"),
    path("articles/<slug:slug>/view/", ArticleTrackView.as_view(), name="api-article-view"),
    path("newsletter/subscribe/", NewsletterSubscribeView.as_view(), name="api-newsletter"),
    path("contact/", ContactCreateView.as_view(), name="api-contact"),
    path("notifications/vapid-key/", VapidPublicKeyView.as_view(), name="api-vapid-key"),
    path("notifications/subscribe/", SubscribePushView.as_view(), name="api-push-subscribe"),
    path("notifications/unsubscribe/", UnsubscribePushView.as_view(), name="api-push-unsubscribe"),
    path("auth/register/", RegisterView.as_view(), name="api-register"),
    path("auth/login/", EmailTokenObtainPairView.as_view(), name="api-login"),
    path("auth/refresh/", TokenRefreshView.as_view(), name="api-token-refresh"),
    path("auth/me/", MeView.as_view(), name="api-me"),
    path("auth/password/change/", PasswordChangeView.as_view(), name="api-password-change"),
    path("ads/", include("ads.urls")),
    path("upload/ckeditor/", ckeditor5_image_upload, name="ckeditor-upload"),
    path("", include(router.urls)),
]

urlpatterns = [
    path("favicon.ico", RedirectView.as_view(url="/static/admin/img/icon.svg", permanent=False)),
    path("admin/", hotreports_admin_site.urls),
    path("api/v1/", include(api_v1)),
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
    path("api/redoc/", SpectacularRedocView.as_view(url_name="schema"), name="redoc"),
    path("", RedirectView.as_view(url="/admin/", permanent=False), name="home"),
]

if not settings.USE_S3:
    if settings.DEBUG:
        urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    else:
        urlpatterns += [
            re_path(r"^media/(?P<path>.*)$", serve, {"document_root": settings.MEDIA_ROOT}),
        ]
