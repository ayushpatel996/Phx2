export async function getTopTracks() {
    const response = await fetch("/spotify/top-tracks");
    if (!response.ok) return null;
    return response.json();
}

export async function getTopPlaylists() {
    const response = await fetch("/spotify/top-playlists");
    if (!response.ok) return null;
    return response.json();
}

export async function getSpotifyAuthUrl() {
    const response = await fetch("/spotify/get-auth-url");
    const data = await response.json();
    return data.url;
}

export async function checkSpotifyAuth() {
    const response = await fetch("/spotify/is-authenticated");
    const data = await response.json();
    return data.status;
}
