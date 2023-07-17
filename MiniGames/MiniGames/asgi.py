"""
ASGI config for MiniGames project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/3.2/howto/deployment/asgi/
"""

import os

import django
from django.core.asgi import get_asgi_application
from main.middleware import SessionAuthMiddlewareStack


from channels.routing import ProtocolTypeRouter, URLRouter

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'MiniGames.settings')

django.setup()
import main.routing
import friends.routing

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": SessionAuthMiddlewareStack(
        URLRouter(
            (main.routing.websocket_urlpatterns + friends.routing.websocket_urlpatterns)
        )
    ),
})
