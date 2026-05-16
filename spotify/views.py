import logging
from django.shortcuts import redirect
from .credentials import REDIRECT_URI, CLIENT_SECRET, CLIENT_ID
from rest_framework.views import APIView
from requests import Request, post
from requests.exceptions import RequestException
from rest_framework import status
from rest_framework.response import Response

logger = logging.getLogger(__name__)
from .util import (
    REQUEST_TIMEOUT,
    is_spotify_authenticated,
    update_or_create_user_tokens,
    execute_spotify_api_request,
    pause_song,
    play_song,
    skip_song,
    search_spotify,
    add_to_queue,
    get_queue,
)
from api.models import Room
from .models import Vote


class AuthURL(APIView):
    def get(self, request, format=None):
        scopes = 'user-read-playback-state user-modify-playback-state user-read-currently-playing user-top-read playlist-read-private'

        url = Request('GET', 'https://accounts.spotify.com/authorize', params={
            'scope': scopes,
            'response_type': 'code',
            'redirect_uri': REDIRECT_URI,
            'client_id': CLIENT_ID
        }).prepare().url

        return Response({'url': url}, status=status.HTTP_200_OK)


def spotify_callback(request, format=None):
    error = request.GET.get('error')
    code = request.GET.get('code')

    if error or not code:
        logger.error(f"Spotify callback error: {error}. Code present: {bool(code)}")
        # User denied auth or something went wrong — redirect home
        return redirect('frontend:')

    try:
        response = post(
            'https://accounts.spotify.com/api/token',
            data={
                'grant_type': 'authorization_code',
                'code': code,
                'redirect_uri': REDIRECT_URI,
                'client_id': CLIENT_ID,
                'client_secret': CLIENT_SECRET
            },
            timeout=REQUEST_TIMEOUT,
        ).json()
    except RequestException as e:
        logger.error(f"Spotify token exchange request failed: {e}")
        return redirect('frontend:')

    access_token = response.get('access_token')
    token_type = response.get('token_type')
    refresh_token = response.get('refresh_token')
    expires_in = response.get('expires_in')
    error = response.get('error')

    if error or not access_token:
        logger.error(f"Spotify token exchange returned error: {error}. Access token present: {bool(access_token)}")
        return redirect('frontend:')

    if not request.session.exists(request.session.session_key):
        request.session.create()

    update_or_create_user_tokens(
        request.session.session_key, access_token, token_type, expires_in, refresh_token)

    return redirect('frontend:')


class IsAuthenticated(APIView):
    def get(self, request, format=None):
        is_authenticated = is_spotify_authenticated(
            self.request.session.session_key)
        return Response({'status': is_authenticated}, status=status.HTTP_200_OK)


class CurrentSong(APIView):
    def get(self, request, format=None):
        room_code = self.request.session.get('room_code')
        room = Room.objects.filter(code=room_code).first()
        if not room:
            logger.warning(f"CurrentSong: Room not found for code {room_code}")
            return Response({}, status=status.HTTP_404_NOT_FOUND)

        host = room.host
        endpoint = "me/player/currently-playing"
        response = execute_spotify_api_request(host, endpoint)

        if 'error' in response or 'item' not in response:
            if 'error' in response:
                logger.error(f"Spotify currently-playing error for host {host}: {response['error']}")
            return Response({}, status=status.HTTP_204_NO_CONTENT)

        item = response.get('item')
        duration = item.get('duration_ms')
        progress = response.get('progress_ms')
        album_cover = item.get('album').get('images')[0].get('url')
        is_playing = response.get('is_playing')
        song_id = item.get('id')

        artist_string = ""

        for i, artist in enumerate(item.get('artists')):
            if i > 0:
                artist_string += ", "
            name = artist.get('name')
            artist_string += name

        votes = Vote.objects.filter(room=room, song_id=song_id).count()

        song = {
            'title': item.get('name'),
            'artist': artist_string,
            'duration': duration,
            'time': progress,
            'image_url': album_cover,
            'is_playing': is_playing,
            'votes': votes,
            'votes_required': room.votes_to_skip,
            'id': song_id
        }
        self.update_room_song(room, song_id)
        return Response(song, status=status.HTTP_200_OK)

    def update_room_song(self, room, song_id):
        if room.current_song != song_id:
            room.current_song = song_id
            room.save(update_fields=['current_song'])
            Vote.objects.filter(room=room).delete()



class PauseSong(APIView):
    def put(self, request, format=None):
        room_code = self.request.session.get('room_code')
        room = Room.objects.filter(code=room_code).first()
        if not room:
            logger.warning(f"PauseSong: Room not found for code {room_code}")
            return Response({}, status=status.HTTP_404_NOT_FOUND)
        if self.request.session.session_key == room.host or room.guest_can_pause:
            pause_song(room.host)
            return Response({}, status=status.HTTP_204_NO_CONTENT)
        return Response({}, status=status.HTTP_403_FORBIDDEN)


class PlaySong(APIView):
    def put(self, request, format=None):
        room_code = self.request.session.get('room_code')
        room = Room.objects.filter(code=room_code).first()
        if not room:
            logger.warning(f"PlaySong: Room not found for code {room_code}")
            return Response({}, status=status.HTTP_404_NOT_FOUND)
        if self.request.session.session_key == room.host or room.guest_can_pause:
            play_song(room.host)
            return Response({}, status=status.HTTP_204_NO_CONTENT)
        return Response({}, status=status.HTTP_403_FORBIDDEN)


class SkipSong(APIView):
    def post(self, request, format=None):
        room_code = self.request.session.get('room_code')
        room = Room.objects.filter(code=room_code).first()
        if not room:
            logger.warning(f"SkipSong: Room not found for code {room_code}")
            return Response({}, status=status.HTTP_404_NOT_FOUND)

        votes = Vote.objects.filter(room=room, song_id=room.current_song)
        votes_needed = room.votes_to_skip

        if self.request.session.session_key == room.host or votes.count() + 1 >= votes_needed:
            votes.delete()
            skip_song(room.host)
        else:
            vote = Vote(user=self.request.session.session_key,
                        room=room, song_id=room.current_song)
            vote.save()

        return Response({}, status=status.HTTP_204_NO_CONTENT)


class TopTracks(APIView):
    def get(self, request, format=None):
        session_id = self.request.session.session_key
        if not is_spotify_authenticated(session_id):
            logger.warning(f"TopTracks: User not authenticated (session: {session_id})")
            return Response({'error': 'Not authenticated'}, status=status.HTTP_401_UNAUTHORIZED)
        
        endpoint = "me/top/tracks?limit=5&time_range=medium_term"
        response = execute_spotify_api_request(session_id, endpoint)

        if 'items' not in response:
            logger.warning(f"TopTracks: No items in response for session {session_id}. Response: {response}")
            return Response({'error': 'No tracks found'}, status=status.HTTP_204_NO_CONTENT)

        tracks = []
        for item in response.get('items'):
            artist_string = ", ".join([artist.get('name') for artist in item.get('artists')])
            tracks.append({
                'title': item.get('name'),
                'artist': artist_string,
                'image_url': item.get('album').get('images')[0].get('url'),
                'url': item.get('external_urls').get('spotify')
            })
        
        return Response(tracks, status=status.HTTP_200_OK)


class TopPlaylists(APIView):
    def get(self, request, format=None):
        session_id = self.request.session.session_key
        if not is_spotify_authenticated(session_id):
            logger.warning(f"TopPlaylists: User not authenticated (session: {session_id})")
            return Response({'error': 'Not authenticated'}, status=status.HTTP_401_UNAUTHORIZED)
        
        endpoint = "me/playlists?limit=5"
        response = execute_spotify_api_request(session_id, endpoint)

        if 'items' not in response:
            logger.warning(f"TopPlaylists: No items in response for session {session_id}. Response: {response}")
            return Response({'error': 'No playlists found'}, status=status.HTTP_204_NO_CONTENT)

        playlists = []
        for item in response.get('items'):
            playlists.append({
                'name': item.get('name'),
                'image_url': item.get('images')[0].get('url') if item.get('images') else None,
                'tracks_count': item.get('tracks').get('total'),
                'url': item.get('external_urls').get('spotify')
            })
        
        return Response(playlists, status=status.HTTP_200_OK)


class SearchSpotify(APIView):
    def get(self, request, format=None):
        query = request.GET.get('q')
        if not query:
            return Response({'error': 'No query provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        session_id = self.request.session.session_key
        response = search_spotify(session_id, query)
        
        if 'error' in response:
            return Response(response, status=status.HTTP_400_BAD_REQUEST)
            
        tracks = []
        for item in response.get('tracks', {}).get('items', []):
            artist_string = ", ".join([artist.get('name') for artist in item.get('artists')])
            tracks.append({
                'id': item.get('id'),
                'uri': item.get('uri'),
                'title': item.get('name'),
                'artist': artist_string,
                'image_url': item.get('album').get('images')[0].get('url') if item.get('album').get('images') else None,
                'duration_ms': item.get('duration_ms')
            })
            
        return Response(tracks, status=status.HTTP_200_OK)


class AddToQueue(APIView):
    def post(self, request, format=None):
        room_code = self.request.session.get('room_code')
        room = Room.objects.filter(code=room_code).first()
        if not room:
            return Response({'error': 'Room not found'}, status=status.HTTP_404_NOT_FOUND)
            
        uri = request.data.get('uri')
        if not uri:
            return Response({'error': 'No track URI provided'}, status=status.HTTP_400_BAD_REQUEST)
            
        # For now, anyone in the room can add to the host's queue
        response = add_to_queue(room.host, uri)
        
        if 'error' in response:
             return Response(response, status=status.HTTP_400_BAD_REQUEST)
             
        return Response({'success': True}, status=status.HTTP_200_OK)


class GetQueue(APIView):
    def get(self, request, format=None):
        room_code = self.request.session.get('room_code')
        room = Room.objects.filter(code=room_code).first()
        if not room:
            return Response({'error': 'Room not found'}, status=status.HTTP_404_NOT_FOUND)
            
        response = get_queue(room.host)
        
        if 'error' in response or 'queue' not in response:
            return Response({'error': 'Could not fetch queue'}, status=status.HTTP_400_BAD_REQUEST)
            
        queue = []
        # Return the next 5 tracks in the queue
        for item in response.get('queue')[:5]:
            artist_string = ", ".join([artist.get('name') for artist in item.get('artists')])
            queue.append({
                'id': item.get('id'),
                'title': item.get('name'),
                'artist': artist_string,
                'image_url': item.get('album').get('images')[0].get('url') if item.get('album').get('images') else None,
                'duration_ms': item.get('duration_ms')
            })
            
        return Response(queue, status=status.HTTP_200_OK)
