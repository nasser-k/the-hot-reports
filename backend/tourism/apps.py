from django.apps import AppConfig


class TourismConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "tourism"
    verbose_name = "🏔️ Tourism"

    def ready(self):
        # Import file cleanup signals (registered in news.file_cleanup)
        import news.file_cleanup  # noqa: F401
