import hashlib
import json
from djangochannelsrestframework.generics import GenericAsyncAPIConsumer
from djangochannelsrestframework.observer.generics import (ObserverModelInstanceMixin, action)
from .serializers import RoomsSerializers, MemberSerializers
from .models import Member, MemberImage, Rooms
from djangochannelsrestframework.observer import model_observer
from channels.db import database_sync_to_async
from asgiref.sync import sync_to_async
from channels.exceptions import StopConsumer

from main.serializers import MemberSerializers
from friends.models import Questions, PreviousQuestions
from friends.serializers import MemberSerializers, QuestionsSerializer


class RoomConsumer(ObserverModelInstanceMixin, GenericAsyncAPIConsumer):

    class_serializer =  RoomsSerializers
    queryset = Rooms.objects.all()
    lookup_field = "code"
    
    @action()   
    async def disconnect(self, code, **kwargs):
        if self.groups:
            print('\n\n\n\nDISC\n\n\n\n\n')
            await self.disconnect_user()
            await super().disconnect(code)
 
    async def connect(self):
        if self.groups:
            print('\n\n\n\Connect\n\n\n\n\n')
            await self.change_room_status_reset()
            await self.connect_user()
        await super().connect()
        
    @action()
    async def start_game(self, game, **kwargs):
        
        await self.change_room_starting()
        await self.handle_next_question()
        for group in self.groups:
            await self.channel_layer.group_send(
                group,
                {
                    'type': 'send_message',
                    'data': {'game': game},
                    'action': 'start',
                }
            )
            break

    @action()
    async def update_image(self, **kwargs):
        await self.reset_userimage()

    @action()
    async def update_username(self, username, **kwargs):
        await self.reset_username(username)

    @action()
    async def retrieve(self, **kwargs):
        data = await self.get_serialize_retrieve()
        await self.send_json(data)

    @action()
    async def subscribe_to_member_activity(self, **kwargs): 
        room = await self.get_room_sync()
        await self.member_activity.subscribe(room=room)

    @action()
    async def unsubscribe_to_member_activity(self, **kwargs): 
        room = await self.get_room_sync()
        await self.member_activity.unsubscribe(room=room)



    @model_observer(Member)
    async def member_activity(self, message: MemberSerializers, observer=None, **kwargs):
        if self.scope['user'].id == message['data']['pk']:
            message['data']['me'] = True
        await self.send_json(message)

    @member_activity.groups_for_signal
    def member_activity(self, instance: Member, **kwargs):
        yield f'room_{instance.room}'
        yield f'member_{instance.pk}'

    @member_activity.groups_for_consumer
    def member_activity(self, room=None, member=None, **kwargs):
        if room is not None:
            yield f'room_{room}'
        if member is not None:
            yield f'member_{member}'

    @member_activity.serializer
    def member_activity(self, instance, action, **kwargs) -> MemberSerializers:
        
        data = MemberSerializers(instance).data
        return dict(data=data, action=action.value, model='Member')    

    

    @database_sync_to_async
    def change_room_starting(self):
        room = self.get_room()
        room.starting = True
        room.save()
    
    @database_sync_to_async
    def change_room_status_reset(self):
        member_total = self.get_count_members_total()
        member_online = self.get_count_members_online()

        if member_total == member_online:
            room = self.get_room()
            if room.starting:
                room.starting = False
                room.save()
    
    @database_sync_to_async
    def reset_userimage(self):
        user = self.scope['user']
        exists_images = Member.objects.filter(room=self.get_room()) \
                                    .values('image_id')
        image = MemberImage.objects.exclude(id__in=exists_images).order_by('?').first()
        user.image = image
        user.save()


    @database_sync_to_async
    def reset_username(self, username):
        user = self.scope['user']
        user.name = username
        user.save()

    @database_sync_to_async
    def get_serialize_retrieve(self):
        members = Member.objects.filter(room=self.scope['code'])
        data = MemberSerializers(members, many=True).data
        for i in range(len(data)):
            if data[i]['pk'] == self.scope['user'].id:
                data[i]['me'] = True
        data = dict(data=data, action='retrieve')
        return data
    
    @database_sync_to_async
    def get_room_sync(self):
        room = Rooms.objects.get(code=self.scope['code'])
        return room
    
    @database_sync_to_async
    def disconnect_user(self):
        room = self.get_room()
        if not room.starting:
            self.scope['user'].is_online = False
            self.scope['user'].save()
            print('offline')

        room = self.get_room()
        count_members_online = self.get_count_members_online()

        if count_members_online == 0:
            room.delete()
        
        return count_members_online

    @database_sync_to_async
    def connect_user(self):

        self.scope['user'].is_online = True
        self.scope['user'].save()
    
    @database_sync_to_async
    def get_count_members_online_async(self):
        count_members_online = Member.objects.filter(room=self.scope['code'], is_online=True).count()
        return count_members_online


    def get_count_members_online(self):
        count_members_online = Member.objects.filter(room=self.scope['code'], is_online=True).count()
        return count_members_online

    def get_count_members_total(self):
        count_members_online = Member.objects.filter(room=self.scope['code']).count()
        return count_members_online

    async def send_message(self, event: dict):
        await self.send(text_data=json.dumps({'data': event["data"], 'action': event["action"]}))
    
    def get_room(self):
        room = Rooms.objects.get(code=self.scope['code'])
        return room
    


    






    #костыль


    @database_sync_to_async
    def handle_next_question(self, *args, **kwargs):
        verify, data = self.get_next_question()

        current_member = self.get_current_member()

        if verify:
            self.add_to_previous_question(data['id'])
            data['question'] = data['question'].replace('{name}',current_member)
            data['is_end'] = False
        
        return data
    
    def get_current_member(self):
        room = self.get_room()
        member_correct_answer = Member.objects.filter(room=room, correct_answer=True).first()  
        
        if not member_correct_answer:
            members = Member.objects.filter(room=room, is_online=True)
            member_correct_answer = members.first()
            member_correct_answer.correct_answer = True
            member_correct_answer.save() 

        return MemberSerializers(member_correct_answer).data['name']

    def get_next_question(self):
        room = self.get_room()
        previous_id = PreviousQuestions.objects.filter(room=room) \
            .values('question_id')
        
        count_question = Questions.objects.all().count()
        count_prev = previous_id.count()
        if count_question == count_prev:
            return False, {'question': 'Все вопросы закончились!', 'is_end': True}

        next_question = Questions.objects.exclude(id__in=previous_id).order_by('?').first()
        data = QuestionsSerializer(next_question).data
        return True, data

    def add_to_previous_question(self, pk):
        question = Questions.objects.get(pk=pk)
        room = self.get_room()
        previous_question = PreviousQuestions(question=question, room=room)
        previous_question.save()
    
    
    
