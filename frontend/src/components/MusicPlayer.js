import React from "react";
import PlayArrow from "@mui/icons-material/PlayArrow";
import Pause from "@mui/icons-material/Pause";
import SkipNext from "@mui/icons-material/SkipNext";
import { pauseSong, playSong, skipSong } from "../api/spotifyApi";

function formatTime(ms) {
  if (!ms) return "0:00";
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export default function MusicPlayer({
  title,
  artist,
  image_url,
  is_playing,
  time,
  duration,
  votes,
  votes_required,
}) {
  const songProgress = duration ? (time / duration) * 100 : 0;

  return (
    <div className="relative group overflow-hidden rounded-3xl glass transition-all duration-500 hover:shadow-spotify-green/10">
      <div 
        className="absolute inset-0 opacity-20 blur-3xl scale-150 transition-all duration-1000"
        style={{ background: `radial-gradient(circle, ${is_playing ? '#1DB954' : '#ffffff'} 0%, transparent 70%)` }}
      />

      <div className="relative z-10 flex flex-col p-6 gap-6">
        <div className="flex items-center gap-6">
          <div className="relative flex-shrink-0">
            <img
              src={image_url || "https://via.placeholder.com/150"}
              alt={title}
              className={`w-24 h-24 rounded-2xl shadow-2xl transition-all duration-700 ${is_playing ? 'scale-100 rotate-0' : 'scale-90 -rotate-3 opacity-60'}`}
            />
            {is_playing && (
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-spotify-green rounded-full flex items-center justify-center animate-pulse">
                <div className="w-2 h-2 bg-black rounded-full" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold truncate tracking-tight mb-1">
              {title || "Nothing Playing"}
            </h2>
            <p className="text-white/50 text-sm font-medium truncate">
              {artist || "Host is idle"}
            </p>

            <div className="flex items-center gap-4 mt-4">
              <button
                onClick={() => (is_playing ? pauseSong() : playSong())}
                className="w-12 h-12 flex items-center justify-center bg-white text-black rounded-full hover:scale-110 active:scale-95 transition-all shadow-xl"
              >
                {is_playing ? (Pause && <Pause fontSize="medium" />) : (PlayArrow && <PlayArrow fontSize="medium" />)}
              </button>

              <div className="flex items-center gap-1 group/skip">
                <button
                  onClick={skipSong}
                  className="w-10 h-10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all"
                >
                  {SkipNext && <SkipNext />}
                </button>
                <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold">
                  {votes} / {votes_required}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="relative h-1 w-full bg-white/10 rounded-full overflow-hidden">
            <div 
              className="absolute h-full bg-spotify-green transition-all duration-1000 ease-linear shadow-[0_0_10px_rgba(29,185,84,0.5)]"
              style={{ width: `${songProgress}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] font-bold tracking-tighter text-white/30 uppercase">
            <span>{formatTime(time)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}