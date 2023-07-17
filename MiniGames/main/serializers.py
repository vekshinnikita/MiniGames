from rest_framework import serializers
from .models import Member, Rooms

class RoomsSerializers(serializers.ModelSerializer):

    class Meta:
        model = Rooms
        fields = ['code',]


class MemberSerializers(serializers.ModelSerializer):

    room = RoomsSerializers()

    class Meta:
        model = Member
        fields = ['name', 'room', 'pk', 'is_online', 'url_image']