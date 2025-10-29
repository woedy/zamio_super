"""
WSGI config for core project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.1/howto/deployment/wsgi/
"""

import os

from django.conf import settings
from django.core.wsgi import get_wsgi_application
from whitenoise import WhiteNoise

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')

django_wsgi_app = get_wsgi_application()

application = WhiteNoise(
    django_wsgi_app,
    root=str(settings.STATIC_ROOT) if settings.STATIC_ROOT else None,
    autorefresh=settings.DEBUG,
)
