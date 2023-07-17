from django.urls import path,include

from .views import *

urlpatterns = [
    path('create/', createRoom, name='create'),
    path('connect/', connectRoom, name='checkout'),

]