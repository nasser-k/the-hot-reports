from django.apps import AppConfig


class NewsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "news"
    verbose_name = "📰 News & Content"

    def ready(self):
        # Import signals to register them
        import news.signals  # noqa: F401
        import news.file_cleanup  # noqa: F401  # File deletion handlers
