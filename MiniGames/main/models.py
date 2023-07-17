from django.db import models
from django.contrib.sessions.models import Session

from MiniGames.settings import URL_HOST

# Create your models here.


class Rooms(models.Model):

    code = models.CharField('Код комнаты',max_length=6, primary_key=True, unique=True)  
    started = models.BooleanField('Игра запущена', default=False)
    starting = models.BooleanField('Игра запуcкается', default=False)

    def __str__(self):
        return self.code

class MemberImage(models.Model):
    image = models.ImageField(blank=True, null=True)
    name = models.CharField(max_length=150, null=True, blank=True)
    

class Member(models.Model):

    name = models.CharField('Имя', max_length=150)
    image = models.ForeignKey(MemberImage, on_delete=models.DO_NOTHING, null=True)
    session = models.CharField('Сессия', max_length=150, unique=True, blank=True)
    room = models.ForeignKey(Rooms, on_delete=models.CASCADE, null=True)
    correct_answer = models.BooleanField(default=False)
    is_online = models.BooleanField(default=True)

    def __str__(self):
        return f'{self.name}'

    def url_image(self):
        return URL_HOST + self.image.image.url

    def save(self, *args, **kwargs):

        if not self.image: 
            exists_images = Member.objects.filter(room=self.room) \
                                        .values('image_id')
            image = MemberImage.objects.exclude(id__in=exists_images).order_by('?').first()
            self.image = image

        super().save(*args, **kwargs)
    
class WaitingMember(models.Model):
    member = models.ForeignKey(Member, on_delete=models.CASCADE, null=True)
    room = models.ForeignKey(Rooms, on_delete=models.CASCADE, null=True)

    class Meta:
        abstract = True




