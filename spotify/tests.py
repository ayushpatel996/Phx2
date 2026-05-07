from django.test import TestCase, Client
from unittest.mock import patch, MagicMock
from django.utils import timezone
from datetime import timedelta
from requests.exceptions import RequestException
from api.models import Room
from .models import SpotifyToken, Vote
from .util import execute_spotify_api_request, refresh_spotify_token


class SpotifyTokenModelTests(TestCase):
    """Tests for SpotifyToken model."""

    def test_create_token(self):
        """Should create a SpotifyToken with the given fields."""
        token = SpotifyToken.objects.create(
            user="session-xyz",
            access_token="access_abc",
            refresh_token="refresh_abc",
            token_type="Bearer",
            expires_in=timezone.now() + timedelta(hours=1),
        )
        self.assertEqual(token.user, "session-xyz")
        self.assertEqual(token.access_token, "access_abc")


class VoteModelTests(TestCase):
    """Tests for Vote model."""

    def setUp(self):
        self.room = Room.objects.create(host="host-001", votes_to_skip=2)

    def test_create_vote(self):
        """Should create a vote associated with a room."""
        vote = Vote.objects.create(
            user="user-001",
            room=self.room,
            song_id="song_abc123",
        )
        self.assertEqual(vote.room, self.room)
        self.assertEqual(vote.song_id, "song_abc123")

    def test_vote_deleted_on_room_delete(self):
        """Deleting a room should cascade and delete its votes."""
        Vote.objects.create(user="user-002", room=self.room, song_id="song_xyz")
        self.assertEqual(Vote.objects.count(), 1)
        self.room.delete()
        self.assertEqual(Vote.objects.count(), 0)


class IsAuthenticatedViewTests(TestCase):
    """Tests for GET /spotify/is-authenticated."""

    def test_unauthenticated_returns_false(self):
        """A fresh session with no Spotify token should return False."""
        client = Client()
        response = client.get("/spotify/is-authenticated")
        self.assertEqual(response.status_code, 200)
        self.assertFalse(response.json()["status"])


class SpotifyUtilTests(TestCase):
    """Tests for Spotify helper request behavior."""

    def setUp(self):
        self.session_id = "session-util"
        SpotifyToken.objects.create(
            user=self.session_id,
            access_token="access_abc",
            refresh_token="refresh_abc",
            token_type="Bearer",
            expires_in=timezone.now() + timedelta(hours=1),
        )

    @patch("spotify.util.get")
    @patch("spotify.util.post")
    def test_post_request_does_not_fetch_follow_up_state(self, mock_post, mock_get):
        """Control POST calls should not make a redundant GET request."""
        mock_post.return_value = MagicMock(ok=True, status_code=204)

        result = execute_spotify_api_request(self.session_id, "player/next", post_=True)

        self.assertEqual(result, {"success": True, "status_code": 204})
        mock_post.assert_called_once()
        mock_get.assert_not_called()

    @patch("spotify.util.get")
    @patch("spotify.util.put")
    def test_put_request_does_not_fetch_follow_up_state(self, mock_put, mock_get):
        """Control PUT calls should not make a redundant GET request."""
        mock_put.return_value = MagicMock(ok=True, status_code=204)

        result = execute_spotify_api_request(self.session_id, "player/pause", put_=True)

        self.assertEqual(result, {"success": True, "status_code": 204})
        mock_put.assert_called_once()
        mock_get.assert_not_called()

    @patch("spotify.util.post")
    def test_refresh_spotify_token_returns_false_when_request_fails(self, mock_post):
        """Refresh helper should fail gracefully on request errors."""
        mock_post.side_effect = RequestException("boom")

        result = refresh_spotify_token(self.session_id)

        self.assertFalse(result)


class PauseSongViewTests(TestCase):
    """Tests for PUT /spotify/pause."""

    def setUp(self):
        self.client = Client()
        # Create a room so the session has a room_code
        resp = self.client.post(
            "/api/create-room",
            data={"guest_can_pause": False, "votes_to_skip": 1},
            content_type="application/json",
        )
        self.room_code = resp.json()["code"]

    def test_guest_cannot_pause_when_not_allowed(self):
        """A guest should get 403 when guest_can_pause is False."""
        guest = Client()
        guest.post(
            "/api/join-room",
            data={"code": self.room_code},
            content_type="application/json",
        )
        response = guest.put("/spotify/pause", content_type="application/json")
        self.assertEqual(response.status_code, 403)

    def test_pause_without_room_returns_404(self):
        """Trying to pause when not in any room should return 404."""
        fresh = Client()
        response = fresh.put("/spotify/pause", content_type="application/json")
        self.assertEqual(response.status_code, 404)


class SkipSongViewTests(TestCase):
    """Tests for POST /spotify/skip."""

    def setUp(self):
        self.client = Client()
        resp = self.client.post(
            "/api/create-room",
            data={"guest_can_pause": False, "votes_to_skip": 2},
            content_type="application/json",
        )
        self.room_code = resp.json()["code"]
        self.room = Room.objects.get(code=self.room_code)
        self.room.current_song = "test_song_id"
        self.room.save()

    def test_skip_without_room_returns_404(self):
        """Skipping when not in any room should return 404."""
        fresh = Client()
        response = fresh.post("/spotify/skip", content_type="application/json")
        self.assertEqual(response.status_code, 404)

    @patch("spotify.views.skip_song")
    def test_host_can_skip_immediately(self, mock_skip):
        """Host should be able to skip without needing votes."""
        response = self.client.post("/spotify/skip", content_type="application/json")
        self.assertEqual(response.status_code, 204)
        mock_skip.assert_called_once()

    def test_guest_vote_is_recorded(self):
        """A guest vote should be saved as a Vote object."""
        guest = Client()
        guest.post(
            "/api/join-room",
            data={"code": self.room_code},
            content_type="application/json",
        )
        # votes_to_skip=2 so one guest vote should NOT trigger skip
        response = guest.post("/spotify/skip", content_type="application/json")
        self.assertEqual(response.status_code, 204)
        self.assertEqual(Vote.objects.filter(room=self.room).count(), 1)
