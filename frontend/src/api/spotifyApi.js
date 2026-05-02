/**
 * Reads the Django CSRF token cookie value.
 */
function getCsrfToken() {
  const match = document.cookie.match(/csrftoken=([^;]+)/);
  return match ? match[1] : "";
}

const JSON_HEADERS = {
  "Content-Type": "application/json",
  "X-CSRFToken": getCsrfToken(),
};

// --- Spotify API ---

export async function getAuthUrl() {
  const res = await fetch("/spotify/get-auth-url");
  return res.json();
}

export async function isAuthenticated() {
  const res = await fetch("/spotify/is-authenticated");
  return res.json();
}

export async function getCurrentSong() {
  const res = await fetch("/spotify/current-song");
  if (!res.ok) return {};
  return res.json();
}

export async function pauseSong() {
  return fetch("/spotify/pause", { method: "PUT", headers: JSON_HEADERS });
}

export async function playSong() {
  return fetch("/spotify/play", { method: "PUT", headers: JSON_HEADERS });
}

export async function skipSong() {
  return fetch("/spotify/skip", { method: "POST", headers: JSON_HEADERS });
}
