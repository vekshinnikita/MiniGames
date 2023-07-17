from django.contrib import admin
from .models import Member, MemberImage, Rooms
# Register your models here.


@admin.register(Member)
class AdminMemder(admin.ModelAdmin):
    list_display = ('name','room')
    list_display_links = ('name',)


@admin.register(Rooms)
class AdminRooms(admin.ModelAdmin):
    list_display = ('code',)
    list_display_links = ('code',)

@admin.register(MemberImage)
class AdminMemberImage(admin.ModelAdmin):
    list_display = ('name',)
    list_display_links = ('name',)