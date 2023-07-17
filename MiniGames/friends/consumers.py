import json
from djangochannelsrestframework.observer.generics import (action)
from channels.db import database_sync_to_async
from djangochannelsrestframework.observer import model_observer

from main.serializers import MemberSerializers
from main.consumers import RoomConsumer
from main.models import Rooms, Member

from .serializers import *
from .models import *


class GameFriendsConsumer(RoomConsumer):

    @action()       
    async def disconnect(self, code, **kwargs):
        if self.groups:
            count_members_online = await self.get_count_members_online_async()
            if count_members_online > 1:
                data = await self.get_last_question()
                await self.answer_to(data['id'], 0)
                print('answer null')
            await super().disconnect(code)
            
    @action()
    async def answer_to(self, question_id, answer_id, **kwargs):
        delta = await self.handle_question('correct_answer', self.get_correct_answer, question_id=question_id, answer_id=answer_id)
        
        if delta == 0 :
            for group in self.groups:
                await self.channel_layer.group_send(
                    group,
                    {
                        'type': 'send_message',
                        'data': await self.handle_next_question(),
                        'action': 'next'
                    }
                )
                break
    
    @action()
    async def start(self, **kwargs):
        await self.change_member_status()
        await self.change_room_started()
        
        data = await self.get_last_question()
        print(data)
   
        if data:      
            current_member = await self.get_current_member_async()
            data['question'] = data['question'].replace('{name}',current_member)
        else:
            data = await self.handle_next_question()

        await self.send_message({'data': data, 'action': 'start'})

    @action()
    async def reset_game(self, **kwargs):

        await self.reset_prev_questions()
        await self.handle_next_question()
        for group in self.groups:
            await self.channel_layer.group_send(
                group,
                {
                    'type': 'send_message',
                    'action': 'reset_game'
                }
            )
            break

    
    @action()
    async def end_game(self, **kwargs):
        await self.reset_prev_questions()
        await self.change_room_status_starting()
        for group in self.groups:
            await self.channel_layer.group_send(
                group,
                {
                    'type': 'send_message',
                    'action': 'end_game'
                }
            )
            break
        await self.send_message({'action': 'end'})
        
    @action()
    async def subscribe_to_waiting_activity(self, **kwargs): 
        room = await self.get_room_sync()
        await self.waiting_activity.subscribe(room=room)
        

    @model_observer(WaitingMemberFriends)
    async def waiting_activity(self, message: WaitingMemberFriendsSerializer, observer=None, **kwargs):
        await self.send_json(message)

    @waiting_activity.groups_for_signal
    def waiting_activity(self, instance: MemberSerializers, **kwargs):
        yield f'room_{instance.room}'
        yield f'waiting_{instance.pk}'

    @waiting_activity.groups_for_consumer
    def waiting_activity(self, room=None, member=None, **kwargs):
        if room is not None:
            yield f'room_{room}'
        if member is not None:
            yield f'waiting_{member}'

    @waiting_activity.serializer
    def waiting_activity(self, instance, action, **kwargs) -> MemberSerializers:

        waiting_members= WaitingMemberFriends.objects.filter(room=instance.room) \
                                        .values('member_id')
        members = Member.objects.filter(room=instance.room).exclude(id__in=waiting_members)

        data = dict(data=MemberSerializers(members, many=True).data, model='Waiting', action=action.value)
        return data


    @database_sync_to_async
    def change_room_started(self):
        member_total = self.get_count_members_total()
        member_online = self.get_count_members_online()

        if member_total == member_online:
            room = self.get_room()
            if not room.started:
                room.starting = False
                room.started = True
                room.save()
    
    @database_sync_to_async
    def change_room_status_starting(self):
        room = self.get_room()
        room.starting = True
        room.started = False
        room.save()

    @database_sync_to_async
    def get_current_member_async(self):
        return self.get_current_member()

    @database_sync_to_async
    def get_last_question(self): 
        room = self.get_room()
        question = PreviousQuestions.objects.filter(room=room).last()
        if not question:
            return None
        data = QuestionsSerializer(question.question).data
        return data
    
    @database_sync_to_async
    def reset_prev_questions(self): 
        room = self.get_room()
        question = PreviousQuestions.objects.filter(room=room)
        if len(question) != 0 :
            question.delete()
        question = PreviousQuestions.objects.filter(room=room)

    @database_sync_to_async
    def change_member_status(self):
        self.scope['user'].is_online = True
        self.scope['user'].save()

    @database_sync_to_async
    def change_current_member(self):
        room = self.get_room()
        members = Member.objects.filter(room=room, is_online=True)

        members_correct_answer = Member.objects.filter(room=room, correct_answer=True)

        current_member = members_correct_answer.first()
        members = MemberSerializers(members, many=True).data
        
        pk_next_member = self.get_pk_nex_member(members, current_member.pk)
        next_member = Member.objects.get(pk=pk_next_member)

        current_member.correct_answer = False
        current_member.save()
        next_member.correct_answer = True
        next_member.save()


    @database_sync_to_async
    def get_correct_answer(self,pk):
        room = self.get_room()
        correct_member = Member.objects.filter(room=room, correct_answer=True).first()
        correct_answer = WaitingMemberFriends.objects.filter(member=correct_member).first() 

        if correct_answer :
            waiting_member = WaitingMemberFriends.objects.filter(room=room, member__is_online=True).exclude(id=correct_answer.id)

            correct_data = WaitingMemberAnswersSerializer(correct_answer).data
            correct_data['correct'] = True
            data_list = WaitingMemberAnswersSerializer(waiting_member, many=True).data
            data_list.append(correct_data)
        else:
            waiting_member = WaitingMemberFriends.objects.filter(room=room, member__is_online=True)
            data_list = WaitingMemberAnswersSerializer(waiting_member, many=True).data

        return data_list

    @database_sync_to_async
    def member_count(self):
        room =  self.get_room()
        member_count = Member.objects.filter(room=room, is_online=True).count()
        return member_count

    @database_sync_to_async
    def member_waiting(self):
        room =  self.get_room()
        member_waiting = WaitingMemberFriends.objects.filter(room=room).count()
        return member_waiting

    @database_sync_to_async
    def add_to_waiting(self, answer_id=None):
        room = self.get_room()
        waiting_member = WaitingMemberFriends(room=room, member=self.scope['user'])
        if answer_id:
            answer = Answers.objects.get(pk=answer_id)
            waiting_member.answer = answer
        waiting_member.save()

    @database_sync_to_async
    def remove_waiting_member(self):
        room =  self.get_room()
        WaitingMemberFriends.objects.filter(room=room).delete()

    
    async def handle_question(self, action ,func , answer_id=None, **kwargs):
        await self.add_to_waiting(answer_id)    

        member_count = await self.member_count()
        member_waiting = await self.member_waiting()
        if member_count - member_waiting <= 0:
            for group in self.groups:
                await self.channel_layer.group_send(
                    group,
                    {
                        'type': 'send_message',
                        'data': await func(kwargs.get('question_id', None)),
                        'action': action
                    }
                )
                break

            await self.remove_waiting_member() # обнуление списка ожидающих пользователей
            if action == 'correct_answer':
                await self.change_current_member() # замена текущего пользовтеля на следуещего по порядку
        
        return member_count - member_waiting
            

    def get_pk_nex_member(self, members, member_pk):

        for i in range(len(members)):
            if members[i]['pk'] == member_pk:
                try:
                    return members[i+1]['pk']
                except IndexError:
                    return members[0]['pk']


    async def send_message(self, event: dict):  
        dict = {'action': event["action"]}
        if event.get("data"):
            dict['data'] = event.get("data")
        await self.send(text_data=json.dumps(dict))

    
    
    
    
    