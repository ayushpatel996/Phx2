import React, { useState, useEffect, useRef } from "react";
import ContentCopy from "@mui/icons-material/ContentCopy";
import Settings from "@mui/icons-material/Settings";
import ExitToApp from "@mui/icons-material/ExitToApp";
import MusicOff from "@mui/icons-material/MusicOff";
import { useParams, useNavigate } from "react-router-dom";
import CreateRoomPage from "../pages/CreateRoomPage";
import MusicPlayer from "../components/MusicPlayer";
import { getRoom, leaveRoom } from "../api/roomApi";
import { isAuthenticated, getAuthUrl, getCurrentSong } from "../api/spotifyApi";

export default function Room({ leaveRoomCallback }) {
  const { roomCode } = useParams();
  const navigate = useNavigate();

  const [votesToSkip, setVotesToSkip] = useState(2);
  const [guestCanPause, setGuestCanPause] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [song, setSong] = useState(null);
  const [copySnack, setCopySnack] = useState(false);

  const intervalRef = useRef(null);

  const getRoomDetails = async () => {
    const data = await getRoom(roomCode);
    if (!data) {
      leaveRoomCallback();
      navigate("/");
      return;
    }
    setVotesToSkip(data.votes_to_skip);
    setGuestCanPause(data.guest_can_pause);
    setIsHost(data.is_host);
    if (data.is_host) {
      authenticateSpotify();
    }
  };

  const authenticateSpotify = async () => {
    const data = await isAuthenticated();
    if (!data.status) {
      const authData = await getAuthUrl();
      window.location.replace(authData.url);
    }
  };

  const fetchCurrentSong = async () => {
    const data = await getCurrentSong();
    setSong(data && Object.keys(data).length > 0 ? data : null);
  };

  useEffect(() => {
    getRoomDetails();
    intervalRef.current = setInterval(fetchCurrentSong, 3000);
    return () => clearInterval(intervalRef.current);
  }, []);

  const handleLeave = async () => {
    await leaveRoom();
    leaveRoomCallback();
    navigate("/");
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomCode).then(() => {
      setCopySnack(true);
      setTimeout(() => setCopySnack(false), 2000);
    });
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 bg-midnight-900 relative overflow-hidden">
      {song?.image_url && (
        <div 
          className="absolute inset-0 opacity-20 blur-[150px] scale-150 transition-all duration-[3000ms]"
          style={{ backgroundImage: `url(${song.image_url})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
        />
      )}

      <div className="relative z-10 max-w-lg w-full space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-spotify-green rounded-full animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Live Session</span>
          </div>
          
          <button 
            onClick={handleCopyCode}
            className="group relative flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
          >
            <span className="text-xs font-black tracking-widest text-white/60 group-hover:text-white">{roomCode}</span>
            {ContentCopy && <ContentCopy sx={{ fontSize: 12 }} className="text-white/20 group-hover:text-spotify-green transition-colors" />}
            
            {copySnack && (
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-3 py-1 rounded-lg bg-spotify-green text-black text-[9px] font-black uppercase tracking-widest animate-bounce">
                Copied
              </div>
            )}
          </button>
        </div>

        <div className="space-y-6">
          {showSettings ? (
            <div className="glass rounded-[2.5rem] p-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <CreateRoomPage
                update={true}
                votesToSkip={votesToSkip}
                guestCanPause={guestCanPause}
                roomCode={roomCode}
                updateCallback={getRoomDetails}
              />
              <button 
                onClick={() => setShowSettings(false)}
                className="w-full text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-white transition-colors"
              >
                Cancel Changes
              </button>
            </div>
          ) : (
            <>
              {song ? (
                <MusicPlayer {...song} />
              ) : (
                <div className="glass rounded-[2.5rem] py-20 flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center border border-white/5 mb-2">
                    {MusicOff && <MusicOff className="text-white/20" fontSize="large" />}
                  </div>
                  <h3 className="text-xl font-bold tracking-tight">Silent disco?</h3>
                  <p className="text-white/30 text-sm max-w-[200px]">Waiting for the host to start the music on Spotify.</p>
                </div>
              )}
            </>
          )}
        </div>

        {!showSettings && (
          <div className="flex items-center justify-between px-2">
            {isHost ? (
              <button 
                onClick={() => setShowSettings(true)}
                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-white transition-colors"
              >
                {Settings && <Settings sx={{ fontSize: 14 }} />} Room Settings
              </button>
            ) : <div />}
            
            <button 
              onClick={handleLeave}
              className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-red-500/50 hover:text-red-400 transition-colors"
            >
              {ExitToApp && <ExitToApp sx={{ fontSize: 14 }} />} Disconnect
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
