"""ASGI config for The Hot Reports project."""

import os

from django.core.asgi import get_asgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "hotreports.settings")

application = get_asgi_application()
