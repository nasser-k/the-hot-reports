"""Project app config: mirror ModelAdmins onto the custom admin site."""

from django.apps import AppConfig


class HotReportsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "hotreports"
    verbose_name = "The Hot Reports"

    def ready(self) -> None:
        # Custom AdminSite used in urls must host the same ModelAdmins as default site.
        from django.contrib import admin as dj_admin

        from hotreports.admin_site import hotreports_admin_site

        for model, model_admin in list(dj_admin.site._registry.items()):
            if model in hotreports_admin_site._registry:
                continue
            model_admin.admin_site = hotreports_admin_site
            hotreports_admin_site._registry[model] = model_admin
            dj_admin.site.unregister(model)
