from rest_framework import viewsets, views, generics
from django.shortcuts import get_object_or_404
from django.http import HttpResponseRedirect
from django.views.generic import TemplateView
from .serializers import MemberSerializers, RoomsSerializers
from .models import Rooms, Member
from django.shortcuts import render, reverse
from .service import generate_code

from rest_framework.decorators import api_view
from rest_framework.response import Response

@api_view(['POST'])
def connectRoom(request):
    request.session.create()

    session_key = request.session.session_key
    code = request.data['code']
    user = request.data['user']
    errors = []
    
    if Rooms.objects.filter(code=code).exists():
        room = Rooms.objects.get(code=code)
        if not room.started:
            if not Member.objects.filter(name=user, room=room).exists():
                member = Member.objects.create(name=user, session=session_key, room=room)
            else:
                errors.append('Пользователь с таким именем уже есть в комнате')
        else:
            errors.append('В этой комнате уже запущина игра')
        return Response({"code": code, 'session_key': session_key, "errors": errors})
    return Response({"code": code, "errors": ['Комнаты с таким кодом не существует']})

@api_view(['POST'])
def createRoom(request):
    request.session.create()
    user = request.data['user']

    code = generate_code()
    session_key = request.session.session_key

    while Rooms.objects.filter(code=code).exists():
        code = generate_code()
    room = Rooms(code=code)
    room.save()

    Member.objects.create(name=user, session=session_key, room=room)
    return Response({'code': code, 'session_key': session_key, 'errors': []})


    




