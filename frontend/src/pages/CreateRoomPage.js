import React, { useState } from "react";
import Tune from "@mui/icons-material/Tune";
import ArrowBack from "@mui/icons-material/ArrowBack";
import { Link, useNavigate } from "react-router-dom";
import { createRoom, updateRoom } from "../api/roomApi";

const defaultProps = {
  votesToSkip: 2,
  guestCanPause: true,
  update: false,
  roomCode: null,
  updateCallback: () => {},
};

export default function CreateRoomPage(props) {
  const {
    votesToSkip: initialVotes,
    guestCanPause: initialPause,
    update,
    roomCode,
    updateCallback,
  } = { ...defaultProps, ...props };

  const navigate = useNavigate();
  const [guestCanPause, setGuestCanPause] = useState(initialPause);
  const [votesToSkip, setVotesToSkip] = useState(initialVotes);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleRoomButtonPressed = async () => {
    const data = await createRoom(guestCanPause, votesToSkip);
    if (data?.code) {
      navigate("/room/" + data.code);
    } else {
      setErrorMsg("Failed to create room.");
    }
  };

  const handleUpdateButtonPressed = async () => {
    const res = await updateRoom(roomCode, guestCanPause, votesToSkip);
    if (res.ok) {
      setSuccessMsg("Updated!");
    } else {
      setErrorMsg("Error.");
    }
    updateCallback();
  };

  return (
    <div className={`${update ? "" : "min-h-screen w-full flex items-center justify-center p-6 bg-midnight-900"}`}>
      <div className={`${update ? "space-y-6" : "max-w-md w-full glass rounded-[2.5rem] p-10 space-y-8"}`}>
        
        {!update && (
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-white/10">
              {Tune && <Tune className="text-spotify-green" />}
            </div>
            <h1 className="text-3xl font-black tracking-tight">Create Room</h1>
            <p className="text-white/40 text-sm">Configure your collaborative session.</p>
          </div>
        )}

        {(errorMsg || successMsg) && (
          <div className={`p-3 rounded-xl text-[10px] uppercase font-black tracking-[0.2em] text-center ${successMsg ? 'bg-spotify-green/10 text-spotify-green' : 'bg-red-500/10 text-red-400'}`}>
            {successMsg || errorMsg}
          </div>
        )}

        <div className="space-y-8">
          <div className="space-y-4 text-center">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Guest Controls</span>
            <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5">
              <button
                onClick={() => setGuestCanPause(true)}
                className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${guestCanPause ? 'bg-white/10 text-white shadow-xl' : 'text-white/30 hover:text-white/50'}`}
              >
                Full Access
              </button>
              <button
                onClick={() => setGuestCanPause(false)}
                className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${!guestCanPause ? 'bg-white/10 text-white shadow-xl' : 'text-white/30 hover:text-white/50'}`}
              >
                View Only
              </button>
            </div>
          </div>

          <div className="space-y-4 text-center">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Votes to Skip</span>
            <div className="flex items-center justify-center gap-6">
              <button 
                onClick={() => setVotesToSkip(Math.max(1, votesToSkip - 1))}
                className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-xl hover:bg-white/5 active:scale-90 transition-all"
              >
                -
              </button>
              <span className="text-4xl font-black tabular-nums">{votesToSkip}</span>
              <button 
                onClick={() => setVotesToSkip(votesToSkip + 1)}
                className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-xl hover:bg-white/5 active:scale-90 transition-all"
              >
                +
              </button>
            </div>
          </div>

          <button
            onClick={update ? handleUpdateButtonPressed : handleRoomButtonPressed}
            className="btn-spotify w-full"
          >
            {update ? "Update Settings" : "Launch Room"}
          </button>

          {!update && (
            <div className="text-center">
              <Link to="/" className="inline-flex items-center gap-2 text-white/30 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest">
                {ArrowBack && <ArrowBack sx={{ fontSize: 14 }} />} Back
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
