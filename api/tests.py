from django.test import TestCase, Client
from django.urls import reverse
from .models import Room


class RoomModelTests(TestCase):
    """Tests for the Room model."""

    def test_generate_unique_code_length(self):
        """Room code should be 6 uppercase characters."""
        room = Room.objects.create(host="test-session-001")
        self.assertEqual(len(room.code), 6)
        self.assertTrue(room.code.isupper())

    def test_room_codes_are_unique(self):
        """Two rooms must not share the same code."""
        room1 = Room.objects.create(host="host-001")
        room2 = Room.objects.create(host="host-002")
        self.assertNotEqual(room1.code, room2.code)

    def test_room_defaults(self):
        """Default values should be correctly set."""
        room = Room.objects.create(host="host-003")
        self.assertFalse(room.guest_can_pause)
        self.assertEqual(room.votes_to_skip, 1)
        self.assertIsNone(room.current_song)


class CreateRoomViewTests(TestCase):
    """Tests for POST /api/create-room."""

    def setUp(self):
        self.client = Client()

    def test_create_room_returns_201(self):
        """Creating a room should return HTTP 201."""
        response = self.client.post(
            "/api/create-room",
            data={"guest_can_pause": True, "votes_to_skip": 2},
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 201)

    def test_create_room_returns_room_code(self):
        """Response must include a room code."""
        response = self.client.post(
            "/api/create-room",
            data={"guest_can_pause": False, "votes_to_skip": 1},
            content_type="application/json",
        )
        data = response.json()
        self.assertIn("code", data)
        self.assertEqual(len(data["code"]), 6)

    def test_create_room_twice_updates_existing(self):
        """A second create-room from the same session should update, not duplicate."""
        self.client.post(
            "/api/create-room",
            data={"guest_can_pause": False, "votes_to_skip": 1},
            content_type="application/json",
        )
        response = self.client.post(
            "/api/create-room",
            data={"guest_can_pause": True, "votes_to_skip": 3},
            content_type="application/json",
        )
        # Should be 200 (update), not 201 (create)
        self.assertEqual(response.status_code, 200)
        # Only one room should exist for this session
        self.assertEqual(Room.objects.count(), 1)

    def test_create_room_invalid_data_returns_400(self):
        """Sending bad data should return HTTP 400."""
        response = self.client.post(
            "/api/create-room",
            data={},
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 400)


class GetRoomViewTests(TestCase):
    """Tests for GET /api/get-room."""

    def setUp(self):
        self.client = Client()
        # Create a room via the API so a session is established
        response = self.client.post(
            "/api/create-room",
            data={"guest_can_pause": False, "votes_to_skip": 2},
            content_type="application/json",
        )
        self.room_code = response.json()["code"]

    def test_get_room_valid_code(self):
        """Should return room details for a valid code."""
        response = self.client.get(f"/api/get-room?code={self.room_code}")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["code"], self.room_code)

    def test_get_room_invalid_code_returns_404(self):
        """Should return 404 for a non-existent code."""
        response = self.client.get("/api/get-room?code=ZZZZZZ")
        self.assertEqual(response.status_code, 404)

    def test_get_room_no_code_returns_400(self):
        """Should return 400 when code param is missing."""
        response = self.client.get("/api/get-room")
        self.assertEqual(response.status_code, 400)


class JoinRoomViewTests(TestCase):
    """Tests for POST /api/join-room."""

    def setUp(self):
        self.client = Client()
        create_resp = self.client.post(
            "/api/create-room",
            data={"guest_can_pause": False, "votes_to_skip": 1},
            content_type="application/json",
        )
        self.room_code = create_resp.json()["code"]

    def test_join_existing_room(self):
        """Joining a valid room should return 200."""
        guest_client = Client()
        response = guest_client.post(
            "/api/join-room",
            data={"code": self.room_code},
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 200)

    def test_join_nonexistent_room(self):
        """Joining an invalid room code should return 400."""
        guest_client = Client()
        response = guest_client.post(
            "/api/join-room",
            data={"code": "BADCDE"},
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 400)


class LeaveRoomViewTests(TestCase):
    """Tests for POST /api/leave-room."""

    def setUp(self):
        self.client = Client()
        self.client.post(
            "/api/create-room",
            data={"guest_can_pause": False, "votes_to_skip": 1},
            content_type="application/json",
        )

    def test_host_leaves_room_deletes_it(self):
        """When the host leaves, the room should be deleted."""
        self.assertEqual(Room.objects.count(), 1)
        response = self.client.post("/api/leave-room", content_type="application/json")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(Room.objects.count(), 0)

    def test_leave_without_being_in_room(self):
        """Leaving when not in a room should still return 200."""
        fresh_client = Client()
        response = fresh_client.post("/api/leave-room", content_type="application/json")
        self.assertEqual(response.status_code, 200)
