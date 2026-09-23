from django.apps import AppConfig


class AccountsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "accounts"
    verbose_name = "👥 Users & Accounts"

    def ready(self):
        # Import file cleanup signals (registered in news.file_cleanup)
        import news.file_cleanup  # noqa: F401
