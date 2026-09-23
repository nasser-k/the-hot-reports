from django.apps import AppConfig


class AdsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "ads"
    verbose_name = "💼 Advertising"

    def ready(self):
        # Import file cleanup signals (registered in news.file_cleanup)
        import news.file_cleanup  # noqa: F401
