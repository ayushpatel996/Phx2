import logging
from .models import SpotifyToken
from django.utils import timezone
from datetime import timedelta
from .credentials import CLIENT_ID, CLIENT_SECRET
from requests import post, put, get
from requests.exceptions import RequestException

logger = logging.getLogger(__name__)


BASE_URL = "https://api.spotify.com/v1/"
REQUEST_TIMEOUT = 5

def get_user_tokens(session_id):
    return SpotifyToken.objects.filter(user=session_id).first()


#saves the token
def update_or_create_user_tokens(session_id, access_token, token_type, expires_in, refresh_token):
    tokens = get_user_tokens(session_id)
    expires_in = timezone.now() + timedelta(seconds=expires_in)#3600 #3600 seconds = 1 hour storing timestamp pf 1 hours later tha ncurrent time so to know when the sesion is going to expire

    if tokens:
        tokens.access_token = access_token
        tokens.refresh_token = refresh_token
        tokens.expires_in = expires_in
        tokens.token_type = token_type
        tokens.save(update_fields=['access_token',
                                   'refresh_token', 'expires_in', 'token_type'])
    else:
        tokens = SpotifyToken(user=session_id, access_token=access_token,
                              refresh_token=refresh_token, token_type=token_type, expires_in=expires_in)
        tokens.save()


def is_spotify_authenticated(session_id):
    tokens = get_user_tokens(session_id)
    if tokens:
        expiry = tokens.expires_in
        if expiry <= timezone.now():#if the current time expiry has passed then refresh it
            refresh_spotify_token(session_id)

        return True

    return False


def refresh_spotify_token(session_id):
    tokens = get_user_tokens(session_id)
    if not tokens:
        return False

    refresh_token = tokens.refresh_token

    try:
        response = post(
            'https://accounts.spotify.com/api/token',
            data={
                'grant_type': 'refresh_token',
                'refresh_token': refresh_token,
                'client_id': CLIENT_ID,
                'client_secret': CLIENT_SECRET
            },
            timeout=REQUEST_TIMEOUT,
        ).json()
    except RequestException as e:
        logger.error(f"Error refreshing Spotify token for session {session_id}: {e}")
        return False

    access_token = response.get('access_token')
    token_type = response.get('token_type')
    expires_in = response.get('expires_in')

    if not access_token or not token_type or not expires_in:
        logger.warning(f"Failed to refresh Spotify token for session {session_id}. Response: {response}")
        return False

    update_or_create_user_tokens(
        session_id, access_token, token_type, expires_in, refresh_token)
    return True


def execute_spotify_api_request(session_id, endpoint, post_=False, put_=False, params_=None):
    tokens = get_user_tokens(session_id)
    if not tokens:
        logger.warning(f"execute_spotify_api_request: No tokens found for session {session_id}")
        return {'error': 'User not authenticated'}

    headers = {'Content-Type': 'application/json',
               'Authorization': "Bearer " + tokens.access_token}

    try:
        if post_:
            response = post(BASE_URL + endpoint, headers=headers, params=params_, timeout=REQUEST_TIMEOUT)
            return {'success': response.ok, 'status_code': response.status_code}

        if put_:
            response = put(BASE_URL + endpoint, headers=headers, params=params_, timeout=REQUEST_TIMEOUT)
            return {'success': response.ok, 'status_code': response.status_code}

        response = get(BASE_URL + endpoint, params=params_, headers=headers, timeout=REQUEST_TIMEOUT)
        return response.json()
    except RequestException as e:
        logger.error(f"Spotify API request error for session {session_id} on endpoint {endpoint}: {e}")
        return {'error': 'Issue with request'}


def search_spotify(session_id, query):
    params = {
        'q': query,
        'type': 'track',
        'limit': 10
    }
    return execute_spotify_api_request(session_id, "search", params_=params)


def add_to_queue(session_id, uri):
    params = {
        'uri': uri
    }
    return execute_spotify_api_request(session_id, "me/player/queue", post_=True, params_=params)


def get_queue(session_id):
    return execute_spotify_api_request(session_id, "me/player/queue")


def play_song(session_id):
    return execute_spotify_api_request(session_id, "me/player/play", put_=True)


def pause_song(session_id):
    return execute_spotify_api_request(session_id, "me/player/pause", put_=True)


def skip_song(session_id):
    return execute_spotify_api_request(session_id, "me/player/next", post_=True)
