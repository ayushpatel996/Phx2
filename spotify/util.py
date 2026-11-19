"""Helpers for Spotify tokens and Web API requests."""

import logging
from datetime import timedelta

from django.utils import timezone
from requests import get, post, put
from requests.exceptions import RequestException

from .credentials import CLIENT_ID, CLIENT_SECRET
from .models import SpotifyToken

logger = logging.getLogger(__name__)

BASE_URL = "https://api.spotify.com/v1/"
REQUEST_TIMEOUT = 5


def get_user_tokens(session_id):
    """Return the Spotify token saved for a Django session, if any."""
    return SpotifyToken.objects.filter(user=session_id).first()


def update_or_create_user_tokens(session_id, access_token, token_type, expires_in, refresh_token):
    """Store Spotify credentials and their calculated expiry time."""
    tokens = get_user_tokens(session_id)
    expiry_time = timezone.now() + timedelta(seconds=expires_in)

    if tokens:
        tokens.access_token = access_token
        # Spotify may omit a replacement refresh token; retain the existing one.
        if refresh_token:
            tokens.refresh_token = refresh_token
        tokens.expires_in = expiry_time
        tokens.token_type = token_type
        tokens.save(update_fields=['access_token', 'refresh_token', 'expires_in', 'token_type'])
    else:
        tokens = SpotifyToken(
            user=session_id,
            access_token=access_token,
            refresh_token=refresh_token,
            token_type=token_type,
            expires_in=expiry_time,
        )
        tokens.save()


def is_spotify_authenticated(session_id):
    """Return whether the session has a usable Spotify token."""
    tokens = get_user_tokens(session_id)
    if not tokens:
        return False

    if tokens.expires_in <= timezone.now():
        return refresh_spotify_token(session_id)

    return True


def refresh_spotify_token(session_id):
    """Refresh and save an expired Spotify access token."""
    tokens = get_user_tokens(session_id)
    if not tokens or not tokens.refresh_token:
        return False

    refresh_token = tokens.refresh_token

    try:
        response = post(
            'https://accounts.spotify.com/api/token',
            data={
                'grant_type': 'refresh_token',
                'refresh_token': refresh_token,
                'client_id': CLIENT_ID,
                'client_secret': CLIENT_SECRET,
            },
            timeout=REQUEST_TIMEOUT,
        ).json()
    except RequestException as error:
        logger.error("Error refreshing Spotify token for session %s: %s", session_id, error)
        return False

    access_token = response.get('access_token')
    token_type = response.get('token_type')
    expires_in = response.get('expires_in')

    if not access_token or not token_type or not expires_in:
        logger.warning("Spotify token refresh failed for session %s", session_id)
        return False

    update_or_create_user_tokens(
        session_id, access_token, token_type, expires_in,
        response.get('refresh_token') or refresh_token,
    )
    return True


def execute_spotify_api_request(session_id, endpoint, post_=False, put_=False, params_=None):
    """Call a Spotify Web API endpoint using the session's access token."""
    tokens = get_user_tokens(session_id)
    if not tokens:
        logger.warning("Spotify API request has no token for session %s", session_id)
        return {'error': 'User not authenticated'}

    headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + tokens.access_token,
    }

    try:
        if post_:
            response = post(BASE_URL + endpoint, headers=headers, params=params_, timeout=REQUEST_TIMEOUT)
            return {'success': response.ok, 'status_code': response.status_code}

        if put_:
            response = put(BASE_URL + endpoint, headers=headers, params=params_, timeout=REQUEST_TIMEOUT)
            return {'success': response.ok, 'status_code': response.status_code}

        response = get(BASE_URL + endpoint, params=params_, headers=headers, timeout=REQUEST_TIMEOUT)
        return response.json()
    except RequestException as error:
        logger.error("Spotify API request failed for session %s on %s: %s", session_id, endpoint, error)
        return {'error': 'Issue with request'}


def search_spotify(session_id, query):
    """Search Spotify for up to ten tracks matching the query."""
    params = {'q': query, 'type': 'track', 'limit': 10}
    return execute_spotify_api_request(session_id, "search", params_=params)


def add_to_queue(session_id, uri):
    """Add a Spotify track URI to the active playback queue."""
    return execute_spotify_api_request(
        session_id, "me/player/queue", post_=True, params_={'uri': uri}
    )


def get_queue(session_id):
    """Return the active Spotify playback queue."""
    return execute_spotify_api_request(session_id, "me/player/queue")


def play_song(session_id):
    """Resume playback for the Spotify account associated with a session."""
    return execute_spotify_api_request(session_id, "me/player/play", put_=True)


def pause_song(session_id):
    """Pause playback for the Spotify account associated with a session."""
    return execute_spotify_api_request(session_id, "me/player/pause", put_=True)


def skip_song(session_id):
    """Skip the current track for the Spotify account associated with a session."""
    return execute_spotify_api_request(session_id, "me/player/next", post_=True)
