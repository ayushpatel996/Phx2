from django.shortcuts import render
from rest_framework import generics, status
from .serializers import RoomSerializer,CreateRoomSerializer
from .models import Room

from rest_framework.views import APIView  #generic api view 
from rest_framework.response import Response #make custom response
# Create your views here.

class RoomView(generics.ListAPIView):   #This will allow to view a room and create a new room (and show it in webapp)
    querySet= Room.objects.all()
    serializer_class= RoomSerializer

class CreateRoomView(APIView):
    serializer_class=CreateRoomSerializer
    
    def post(self, request, format=None):
        if not self.request.session.exists(self.request.session.session_key): #if current user has an active session
            self.request.session.create()
        
        serializer=self.serializer_class(data=request.data)

        if serializer.is_valid() :  #checking validity of votes and skip
            guest_can_pause = serializer.data.get('guest_can_pause')
            votes_to_skip = serializer.data.get('votes_to_skip')
            host=self.request.session.session_key
            
            queryset=Room.objects.filter(host=host)
            if queryset.exists():       #if the room already exits we will update the setting only
                room = queryset[0]
                room.guest_can_pause= guest_can_pause
                room.votes_to_skip = votes_to_skip
                room.save(update_fields=['guest_can_pause','votes_to_skip'])
                return Response(RoomSerializer(room).data, status=status.HTTP_200_OK)
            
            else :                      #Room not existing so creating a new Room
                room = Room(host=host, guest_can_pause=guest_can_pause, votes_to_skip=votes_to_skip)
                room.save()
                return Response(RoomSerializer(room).data, status=status.HTTP_201_CREATED)
        return Response({'Bad Request': 'Invalid data...'}, status=status.HTTP_400_BAD_REQUEST)