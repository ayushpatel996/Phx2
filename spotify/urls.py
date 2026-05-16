from django.urls import path
from .views import AuthURL, spotify_callback, IsAuthenticated, CurrentSong, PauseSong, PlaySong, SkipSong, TopTracks, TopPlaylists, SearchSpotify, AddToQueue, GetQueue

urlpatterns = [
    path('get-auth-url', AuthURL.as_view()),
    path('redirect', spotify_callback),
    path('is-authenticated', IsAuthenticated.as_view()),
    path('current-song', CurrentSong.as_view()),
    path('pause', PauseSong.as_view()),
    path('play', PlaySong.as_view()),
    path('skip', SkipSong.as_view()),
    path('top-tracks', TopTracks.as_view()),
    path('top-playlists', TopPlaylists.as_view()),
    path('search', SearchSpotify.as_view()),
    path('add-to-queue', AddToQueue.as_view()),
    path('queue', GetQueue.as_view())
]
