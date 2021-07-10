from django.db import models
from api.models import  Room

#model that will store tokens
class SpotifyToken(models.Model):
    user = models.CharField( max_length=50, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    refresh_token = models.CharField( max_length=150, null=True)
    access_token = models.CharField( max_length=150)
    expires_in = models.DateTimeField()
    token_type = models.CharField( max_length=50)

#who voted, which song, which room, time of vote
class Vote(models.Model):
    user = models.CharField( max_length=50, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    song_id = models.CharField( max_length=50)
    room = models.ForeignKey(Room, on_delete=models.CASCADE)
