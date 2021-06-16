from django.db import models
import string
import random

def generate_unique_code():                     #to generate a unique code for our room
    length=6

    while(True):
        code =''.join(random.choices(string.ascii_uppercase, k=length))
        
        #Checking if thecode is unique (comparing it to all codes of the rooms in our server)
        if(Room.objects.filter(code=code)).count()==0:
            break
    return code

# Create your models here.
class Room(models.Model):
    code = models.CharField(max_length=8, default=generate_unique_code, unique=True)  #room_code for inviting and joining 
    host = models.CharField(max_length=50, unique=True)             #host of the room   
    guest_can_pause=models.BooleanField(null=False, default=False)  #to pause the current song
    votes_to_skip=models.IntegerField(null=False, default=1)         #vote skipping 
    created_at = models.DateTimeField(auto_now_add=True)            #date and time when the room is created

    #def is_host_this
