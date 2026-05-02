/**
 * Reads the Django CSRF token cookie value.
 * Required for all state-changing (POST/PUT/PATCH/DELETE) requests.
 */
function getCsrfToken() {
  const match = document.cookie.match(/csrftoken=([^;]+)/);
  return match ? match[1] : "";
}

const JSON_HEADERS = {
  "Content-Type": "application/json",
  "X-CSRFToken": getCsrfToken(),
};

// --- Room API ---

export async function getUserRoom() {
  const res = await fetch("/api/user-in-room");
  return res.json();
}

export async function getRoom(code) {
  const res = await fetch(`/api/get-room?code=${code}`);
  if (!res.ok) return null;
  return res.json();
}

export async function createRoom(guestCanPause, votesToSkip) {
  const res = await fetch("/api/create-room", {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify({
      guest_can_pause: guestCanPause,
      votes_to_skip: votesToSkip,
    }),
  });
  return res.json();
}

export async function updateRoom(code, guestCanPause, votesToSkip) {
  const res = await fetch("/api/update-room", {
    method: "PATCH",
    headers: JSON_HEADERS,
    body: JSON.stringify({
      code,
      guest_can_pause: guestCanPause,
      votes_to_skip: votesToSkip,
    }),
  });
  return res;
}

export async function joinRoom(code) {
  const res = await fetch("/api/join-room", {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify({ code }),
  });
  return res;
}

export async function leaveRoom() {
  const res = await fetch("/api/leave-room", {
    method: "POST",
    headers: JSON_HEADERS,
  });
  return res;
}
