"""WSGI config for The Hot Reports project."""

import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "hotreports.settings")

application = get_wsgi_application()
