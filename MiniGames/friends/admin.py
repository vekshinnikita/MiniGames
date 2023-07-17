from django.contrib import admin

from .models import Answers, Questions, WaitingMemberFriends

# Register your models here.
@admin.register(Questions)
class AdminQuestions(admin.ModelAdmin):
    list_display = ('question',)
    list_display_links = ('question',)

@admin.register(Answers)
class AdminAnswers(admin.ModelAdmin):
    list_display = ('question',)
    list_display_links = ('question',)

@admin.register(WaitingMemberFriends)
class WaitingMemberAnswers(admin.ModelAdmin):
    list_display = ('member',)
    list_display_links = ('member',)