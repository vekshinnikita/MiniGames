from rest_framework import serializers

from main.serializers import MemberSerializers

from .models import Questions, Answers, WaitingMemberFriends


class AnswersSerializer(serializers.ModelSerializer):
    

    class Meta:
        model = Answers
        fields = ('answer','id',)


class QuestionsSerializer(serializers.ModelSerializer):

    answers = AnswersSerializer(read_only=True, many=True)

    class Meta:
        model = Questions
        fields = ('question', 'answers', 'id')

class QuestionsCorrectSerializer(serializers.ModelSerializer):

    answers = AnswersSerializer(read_only=True)

    class Meta:
        model = Questions
        fields = ('question', 'answers', 'id')

class WaitingMemberFriendsSerializer(serializers.ModelSerializer):

    member = MemberSerializers(read_only=True)

    class Meta:
        model = WaitingMemberFriends
        fields = ('member',)


class WaitingMemberAnswersSerializer(serializers.ModelSerializer):

    member = MemberSerializers(read_only=True)
    answer = AnswersSerializer(read_only=True)

    class Meta:
        model = WaitingMemberFriends
        fields = ('member', 'answer')
    


