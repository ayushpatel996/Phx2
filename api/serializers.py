#This will convert our class data(located in models.py) to JSON format

from django.db.models.base import Model
from rest_framework import serializers
from .models import Room

class RoomSerializer(serializers.ModelSerializer):
    class Meta:
        model= Room
        fields=('id', 'code', 'host', 'guest_can_pause',
                 'votes_to_skip', 'created_at')

class CreateRoomSerializer(serializers.ModelSerializer):
    #post request sending..
    class Meta:
        model= Room
        fields=('guest_can_pause','votes_to_skip')