from django.db import models

from main.models import Rooms, WaitingMember

# Create your models here.
class Questions(models.Model):

    question = models.TextField('Вопрос')  
    

    def __str__(self):
        return self.question

    class Meta:
        verbose_name = "Вопрос"
        verbose_name_plural = "Вопросы"
    
class Answers(models.Model):

    answer = models.CharField('Ответ',max_length=150, null=True)
    question = models.ForeignKey(Questions, on_delete=models.CASCADE, related_name="answers")

    class Meta:
        verbose_name = "Ответ на вопрос"
        verbose_name_plural = "Ответы на вопрос"
    
class PreviousQuestions(models.Model):

    room = models.ForeignKey(Rooms, on_delete=models.CASCADE, null=True)
    question = models.ForeignKey(Questions, on_delete=models.CASCADE, null=True)

class CurrentQuestion(models.Model):

    room = models.ForeignKey(Rooms, on_delete=models.CASCADE, null=True)
    question = models.ForeignKey(Questions, on_delete=models.CASCADE, null=True)

class WaitingMemberFriends(WaitingMember):

    answer = models.ForeignKey(Answers ,on_delete = models.DO_NOTHING, null=True, related_name="answered")
    correct = models.BooleanField(default=False)