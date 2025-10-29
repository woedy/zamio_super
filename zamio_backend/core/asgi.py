"""
ASGI config for core project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.1/howto/deployment/asgi/
"""

import os

from django.conf import settings
from django.core.asgi import get_asgi_application
from whitenoise import WhiteNoise

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')

django_asgi_app = get_asgi_application()

application = WhiteNoise(
    django_asgi_app,
    root=str(settings.STATIC_ROOT) if settings.STATIC_ROOT else None,
    autorefresh=settings.DEBUG,
)
