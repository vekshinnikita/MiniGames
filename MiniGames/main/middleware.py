import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'MiniGames.settings')
django.setup()

from .models import Member, Rooms
from channels.auth import AuthMiddlewareStack
from channels.sessions import SessionMiddlewareStack
from django.contrib.auth.models import AnonymousUser
from channels.db import database_sync_to_async
from channels.middleware import BaseMiddleware

from django.db import close_old_connections


@database_sync_to_async
def get_user(key):

    if key is not None:
        try:
            user = Member.objects.get(session=key)
        except:
            user = AnonymousUser()
    else:
        user = AnonymousUser()
    return user


class TokenAuthMiddleware(BaseMiddleware):

    async def __call__(self, scope, receive, send):
        close_old_connections()

        query_arr = str(scope['query_string']).split('&')

        session_key = query_arr[0].split('=')[1]
        code = query_arr[1].split('=')[1][0:6]

        
        
        scope['code'] = code
        scope['user'] = await get_user(session_key)
        return await super().__call__(scope, receive, send)


def SessionAuthMiddlewareStack(inner):
    return TokenAuthMiddleware(SessionMiddlewareStack(inner))