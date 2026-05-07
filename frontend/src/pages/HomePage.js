import React, { useState, useEffect } from "react";
import MusicNote from "@mui/icons-material/MusicNote";
import People from "@mui/icons-material/People";
import AddCircleOutlined from "@mui/icons-material/AddCircleOutlined";
import List from "@mui/icons-material/List";
import LinkedIn from "@mui/icons-material/LinkedIn";
import Description from "@mui/icons-material/Description";
import GitHub from "@mui/icons-material/GitHub";
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from "react-router-dom";
import RoomJoinPage from "./RoomJoinPage";
import CreateRoomPage from "./CreateRoomPage";
import Room from "./Room";
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

  const Navbar = () => (
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 p-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 shadow-2xl">
      <a href="#landing" className="px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest text-white/50 hover:text-white transition-all">Home</a>
      {isSpotifyAuthenticated && (
        <>
          <a href="#playlists" className="px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest text-white/50 hover:text-white transition-all">Playlists</a>
          <a href="#tracks" className="px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest text-white/50 hover:text-white transition-all">Tracks</a>
        </>
      )}
      <a href="#creator" className="px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest text-white/50 hover:text-white transition-all">Creator</a>
    </nav>
  );

  const SectionHeader = ({ icon: Icon, title, subtitle }) => (
    <div className="flex flex-col items-center text-center space-y-4 mb-12">
      <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-spotify-green">
        <Icon fontSize="large" />
      </div>
      <h2 className="text-4xl font-black tracking-tight text-white">{title}</h2>
      <p className="text-white/40 text-sm font-medium uppercase tracking-[0.3em]">{subtitle}</p>
    </div>
  );

  const CreatorSection = () => (
    <section id="creator" className="min-h-screen w-full flex flex-col items-center justify-center p-6 relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />
      <SectionHeader icon={People} title="Meet the Creator" subtitle="The mind behind PHx2" />
      <div className="glass max-w-2xl w-full rounded-3xl p-8 text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <div className="h-24 w-24 bg-gradient-to-br from-spotify-green to-blue-500 rounded-3xl mx-auto flex items-center justify-center text-3xl font-black text-black">
          AP
        </div>
        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-white">Ayush Patel</h3>
          <p className="text-white/60 leading-relaxed max-w-md mx-auto">
            Full-stack developer passionate about building seamless music experiences and collaborative platforms. PHx2 is a project born out of the love for shared listening.
          </p>
        </div>
        <div className="flex items-center justify-center gap-4 pt-4">
          <a href="https://www.linkedin.com/in/ayushpatel1312/" target="_blank" rel="noopener noreferrer" className="btn-outline flex items-center gap-2">
            <LinkedIn fontSize="small" /> LinkedIn
          </a>
          <a href="https://drive.google.com/file/d/1IkEwcC6rfWROk8N-kVH3YtydH3_LshXI/view?usp=drive_link" target="_blank" rel="noopener noreferrer" className="btn-outline flex items-center gap-2">
            <Description fontSize="small" /> Resume
          </a>
          <a href="https://github.com/ayushpatel996" target="_blank" rel="noopener noreferrer" className="btn-outline p-3 rounded-full">
            <GitHub fontSize="small" />
          </a>
        </div>
      </div>
    </section>
  );

  const renderHomePage = () => (
    <div className="w-full bg-[#020617]">
      <Navbar />
      
      {/* Landing Section */}
      <section id="landing" className="min-h-screen w-full flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-spotify-green/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="relative z-10 max-w-4xl w-full text-center space-y-16">
          <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-1000">
            <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-white/5 border border-white/10 mb-4 shadow-xl">
              <MusicNote className="text-spotify-green" fontSize="large" />
            </div>
            <h1 className="text-8xl font-black tracking-tighter text-white">
              PHx2<span className="text-spotify-green">.</span>
            </h1>
            <p className="text-2xl text-white/50 font-medium max-w-lg mx-auto leading-relaxed">
              Sync your Spotify. Listen with friends. <br /> Simple as that.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200">
            <Link to="/join" className="btn-spotify w-full sm:w-80 h-16 flex items-center justify-center gap-3 text-xl font-bold shadow-lg shadow-spotify-green/20">
              <People fontSize="small" /> Join Room
            </Link>
            <Link to="/create" className="btn-outline w-full sm:w-80 h-16 flex items-center justify-center gap-3 text-xl font-bold">
              <AddCircleOutlined fontSize="small" /> Start a Room
            </Link>
          </div>

          {!isSpotifyAuthenticated && (
            <div className="pt-8 animate-in fade-in duration-1000 delay-500">
              <button 
                onClick={handleConnectSpotify}
                className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all shadow-2xl"
              >
                <div className="h-2 w-2 rounded-full bg-spotify-green animate-pulse" />
                <span className="text-sm font-bold text-white/60 group-hover:text-white transition-colors">
                  Connect Spotify to unlock your personalized stats
                </span>
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Playlists Section */}
      {isSpotifyAuthenticated && (
        <section id="playlists" className="min-h-screen w-full flex flex-col items-center justify-center p-6 relative">
          <div className="absolute bottom-0 left-0 w-[30%] h-[30%] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />
          <SectionHeader icon={List} title="Top 5 Playlists" subtitle="The collections you love" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl w-full animate-in fade-in slide-in-from-left-8 duration-1000">
            {topPlaylists.map((playlist, i) => (
              <a key={playlist.url} href={playlist.url} target="_blank" rel="noopener noreferrer" className="glass p-6 rounded-3xl flex items-center gap-6 group hover:bg-white/10 transition-all active:scale-95">
                <div className="relative h-20 w-20 flex-shrink-0 rounded-2xl overflow-hidden border border-white/10">
                  {playlist.image_url ? (
                    <img src={playlist.image_url} alt={playlist.name} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  ) : (
                    <div className="h-full w-full bg-white/5 flex items-center justify-center"><List className="text-white/20" /></div>
                  )}
                  <div className="absolute top-2 left-2 h-6 w-6 rounded-md bg-black/60 backdrop-blur-md flex items-center justify-center text-[10px] font-black text-blue-400">#{i + 1}</div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-lg font-bold text-white truncate">{playlist.name}</p>
                  <p className="text-sm text-white/40">{playlist.tracks_count} tracks</p>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Tracks Section */}
      {isSpotifyAuthenticated && (
        <section id="tracks" className="min-h-screen w-full flex flex-col items-center justify-center p-6 relative">
          <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[30%] h-[30%] bg-spotify-green/5 blur-[120px] rounded-full pointer-events-none" />
          <SectionHeader icon={MusicNote} title="Top 5 Tracks" subtitle="Your most played this season" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl w-full animate-in fade-in slide-in-from-right-8 duration-1000">
            {topTracks.map((track, i) => (
              <a key={track.url} href={track.url} target="_blank" rel="noopener noreferrer" className="glass p-6 rounded-3xl flex flex-col gap-4 group hover:bg-white/10 transition-all active:scale-95">
                <div className="relative aspect-square rounded-2xl overflow-hidden border border-white/10">
                  <img src={track.image_url} alt={track.title} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute top-4 left-4 h-8 w-8 rounded-lg bg-black/60 backdrop-blur-md flex items-center justify-center text-xs font-black text-spotify-green">#{i + 1}</div>
                </div>
                <div className="space-y-1">
                  <p className="text-lg font-bold text-white truncate">{track.title}</p>
                  <p className="text-sm text-white/40 truncate">{track.artist}</p>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}

      <CreatorSection />

      {/* Global Footer */}
      <footer className="w-full py-20 flex flex-col items-center space-y-6 opacity-30">
        <div className="h-[1px] w-40 bg-gradient-to-r from-transparent via-white/20 to-transparent mb-6" />
        <div className="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[0.3em] text-white">
          PHx2 • Beta v2.0 • 2026
        </div>
        <p className="text-[10px] text-white/40 uppercase tracking-widest font-medium">Built with React & Django</p>
      </footer>
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
