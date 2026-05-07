import React, { useState, useEffect } from "react";
import MusicNote from "@mui/icons-material/MusicNote";
import People from "@mui/icons-material/People";
import AddCircleOutlined from "@mui/icons-material/AddCircleOutlined";
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from "react-router-dom";
import RoomJoinPage from "./RoomJoinPage";
import CreateRoomPage from "./CreateRoomPage";
import Room from "./Room";
import StatsPanel from "../components/StatsPanel";
import { getUserRoom } from "../api/roomApi";
import { getTopTracks, getTopPlaylists, checkSpotifyAuth, getSpotifyAuthUrl } from "../api/statsApi";

export default function HomePage() {
  const [roomCode, setRoomCode] = useState(null);
  const [isSpotifyAuthenticated, setIsSpotifyAuthenticated] = useState(false);
  const [topTracks, setTopTracks] = useState([]);
  const [topPlaylists, setTopPlaylists] = useState([]);

  useEffect(() => {
    getUserRoom().then((data) => {
      if (data?.code) setRoomCode(data.code);
    });

    checkSpotifyAuth().then((authenticated) => {
      setIsSpotifyAuthenticated(authenticated);
      if (authenticated) {
        loadStats();
      }
    });
  }, []);

  const loadStats = async () => {
    const [tracks, playlists] = await Promise.all([
      getTopTracks(),
      getTopPlaylists(),
    ]);
    if (tracks) setTopTracks(tracks);
    if (playlists) setTopPlaylists(playlists);
  };

  const handleConnectSpotify = async () => {
    const url = await getSpotifyAuthUrl();
    window.location.href = url;
  };

  const clearRoomCode = () => setRoomCode(null);

  const renderHomePage = () => (
    <div className="min-h-screen w-full flex flex-col items-center justify-start p-6 pt-24 pb-32 overflow-x-hidden">
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-spotify-green/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-4xl w-full text-center space-y-16">
        {/* Header Section */}
        <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-1000">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-white/5 border border-white/10 mb-4 shadow-xl">
            {MusicNote && <MusicNote className="text-spotify-green" fontSize="large" />}
          </div>
          <h1 className="text-7xl font-black tracking-tighter text-white">
            PHx2<span className="text-spotify-green">.</span>
          </h1>
          <p className="text-xl text-white/50 font-medium max-w-md mx-auto leading-relaxed">
            Sync your Spotify. Listen with friends. <br /> Simple as that.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200">
          <Link to="/join" className="btn-spotify w-full sm:w-80 h-14 flex items-center justify-center gap-3 text-lg font-bold shadow-lg shadow-spotify-green/20">
            {People && <People fontSize="small" />} Join Room
          </Link>
          <Link to="/create" className="btn-outline w-full sm:w-80 h-14 flex items-center justify-center gap-3 text-lg font-bold">
            {AddCircleOutlined && <AddCircleOutlined fontSize="small" />} Start a Room
          </Link>
        </div>

        {/* Stats Section */}
        <div className="w-full pt-8 delay-500">
          {isSpotifyAuthenticated ? (
            <StatsPanel topTracks={topTracks} topPlaylists={topPlaylists} />
          ) : (
            <button 
              onClick={handleConnectSpotify}
              className="group relative inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
            >
              <div className="h-2 w-2 rounded-full bg-spotify-green animate-pulse" />
              <span className="text-sm font-bold text-white/60 group-hover:text-white transition-colors">
                Connect Spotify to unlock your 2026 stats
              </span>
            </button>
          )}
        </div>
        
        {/* Footer */}
        <div className="pt-12 pb-12 opacity-30">
          <div className="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[0.3em] text-white">
            Beta v2.0 • 2026
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            roomCode ? <Navigate to={`/room/${roomCode}`} replace /> : renderHomePage()
          }
        />
        <Route path="/join" element={<RoomJoinPage />} />
        <Route path="/create" element={<CreateRoomPage />} />
        <Route
          path="/room/:roomCode"
          element={<Room leaveRoomCallback={clearRoomCode} />}
        />
      </Routes>
    </Router>
  );
}
