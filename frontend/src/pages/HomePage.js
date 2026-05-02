import React, { useState, useEffect } from "react";
import MusicNote from "@mui/icons-material/MusicNote";
import People from "@mui/icons-material/People";
import AddCircleOutlined from "@mui/icons-material/AddCircleOutlined";
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from "react-router-dom";
import RoomJoinPage from "./RoomJoinPage";
import CreateRoomPage from "./CreateRoomPage";
import Room from "./Room";
import { getUserRoom } from "../api/roomApi";

export default function HomePage() {
  const [roomCode, setRoomCode] = useState(null);

  useEffect(() => {
    getUserRoom().then((data) => {
      if (data?.code) setRoomCode(data.code);
    });
  }, []);

  const clearRoomCode = () => setRoomCode(null);

  const renderHomePage = () => (
    <div className="min-h-screen w-full flex items-center justify-center p-6">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-spotify-green/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-blue-500/10 blur-[120px] rounded-full" />

      <div className="relative z-10 max-w-2xl w-full text-center space-y-12">
        <div className="space-y-4">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-white/5 border border-white/10 mb-4">
            {MusicNote && <MusicNote className="text-spotify-green" fontSize="large" />}
          </div>
          <h1 className="text-7xl font-black tracking-tighter text-white">
            PHx2<span className="text-spotify-green">.</span>
          </h1>
          <p className="text-xl text-white/50 font-medium max-w-md mx-auto">
            Sync your Spotify. Listen with friends. <br /> Simple as that.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/join" className="btn-spotify w-full sm:w-auto flex items-center justify-center gap-2">
            {People && <People fontSize="small" />} Join Room
          </Link>
          <Link to="/create" className="btn-outline w-full sm:w-auto flex items-center justify-center gap-2">
            {AddCircleOutlined && <AddCircleOutlined fontSize="small" />} Start a Room
          </Link>
        </div>
        
        <div className="pt-12">
          <div className="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[0.3em] text-white/30">
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
