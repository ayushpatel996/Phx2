import React, { useState } from "react";
import ArrowBack from "@mui/icons-material/ArrowBack";
import MeetingRoom from "@mui/icons-material/MeetingRoom";
import { Link, useNavigate } from "react-router-dom";
import { joinRoom } from "../api/roomApi";

export default function RoomJoinPage() {
  const [roomCode, setRoomCode] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleJoin = async () => {
    if (!roomCode) return;
    const res = await joinRoom(roomCode);
    if (res.ok) {
      navigate(`/room/${roomCode}`);
    } else {
      setError("That room doesn't seem to exist.");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleJoin();
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 bg-midnight-900">
      <div className="max-w-md w-full glass rounded-[2.5rem] p-10 space-y-8 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-white/10">
            {MeetingRoom && <MeetingRoom className="text-spotify-green" />}
          </div>
          <h1 className="text-3xl font-black tracking-tight">Join Room</h1>
          <p className="text-white/40 text-sm">Enter the 6-character code shared by your friend.</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <input
              type="text"
              placeholder="ABCDEF"
              value={roomCode}
              onChange={(e) => {
                setError("");
                setRoomCode(e.target.value.toUpperCase());
              }}
              onKeyDown={handleKeyDown}
              maxLength={6}
              className={`input-minimal uppercase ${error ? 'border-red-500/50 focus:border-red-500/50' : ''}`}
              autoFocus
            />
            {error && <p className="text-red-400 text-[10px] uppercase font-black tracking-widest text-center">{error}</p>}
          </div>

          <button
            onClick={handleJoin}
            disabled={roomCode.length < 1}
            className="btn-spotify w-full mt-4"
          >
            Enter Room
          </button>
        </div>

        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 text-white/30 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest">
            {ArrowBack && <ArrowBack sx={{ fontSize: 14 }} />} Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
