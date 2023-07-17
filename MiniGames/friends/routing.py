from django.urls import path, re_path

from .consumers import GameFriendsConsumer


websocket_urlpatterns = [
    path("game/friends", GameFriendsConsumer.as_asgi()),

]