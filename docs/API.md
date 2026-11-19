# API reference

All paths below are relative to the application origin. Room endpoints start with `/api/`; Spotify endpoints start with `/spotify/`. The app uses Django sessions, so requests that change data must include the session cookie and a valid CSRF token.

## Rooms

| Method | Path | Purpose | Notes |
| --- | --- | --- | --- |
| GET | `/api/room` | List rooms | Returns serialized room records. |
| POST | `/api/create-room` | Create or update the current host's room | JSON: `guest_can_pause` (boolean), `votes_to_skip` (integer, at least 1). |
| GET | `/api/get-room?code=CODE` | Get a room | Includes `is_host` for the current session. |
| POST | `/api/join-room` | Join a room | JSON: `code`. |
| GET | `/api/user-in-room` | Get the current session's room code | Returns `{"code": null}` if not in a room. |
| POST | `/api/leave-room` | Leave the current room | A host leaving deletes their room. |
| PATCH | `/api/update-room` | Update room settings | JSON: `code`, `guest_can_pause`, `votes_to_skip`; host only. |

## Spotify

| Method | Path | Purpose | Notes |
| --- | --- | --- | --- |
| GET | `/spotify/get-auth-url` | Get the Spotify authorization URL | Open the returned `url` to connect Spotify. |
| GET | `/spotify/redirect` | Spotify OAuth callback | Configure this exact callback URL in the Spotify app. |
| GET | `/spotify/is-authenticated` | Check Spotify connection | Returns a `status` boolean. |
| GET | `/spotify/current-song` | Get room playback details | Requires the session to be in a room. |
| PUT | `/spotify/pause` | Pause host playback | Host or guests when guest controls are enabled. |
| PUT | `/spotify/play` | Resume host playback | Host or guests when guest controls are enabled. |
| POST | `/spotify/skip` | Skip or vote to skip the current track | Votes are counted per room and track. |
| GET | `/spotify/top-tracks` | Get the connected user's top tracks | Requires Spotify authentication. |
| GET | `/spotify/top-playlists` | Get the connected user's playlists | Requires Spotify authentication. |
| GET | `/spotify/search?q=QUERY` | Search for Spotify tracks | URL-encode the query. |
| POST | `/spotify/add-to-queue` | Add a track to the room host's queue | JSON: `uri`. |
| GET | `/spotify/queue` | Get the next tracks in the host's queue | Requires a valid room and Spotify connection for the host. |

Successful responses use JSON except for playback actions, which return HTTP 204. Errors use standard HTTP status codes such as 400, 401, 403, and 404. Spotify playback endpoints also depend on an active Spotify playback device and the permissions granted during authorization.
