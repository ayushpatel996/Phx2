import React from "react";
import MusicNote from "@mui/icons-material/MusicNote";
import List from "@mui/icons-material/List";

export default function StatsPanel({ topTracks, topPlaylists }) {
  const renderTrackCard = (track, index) => (
    <a
      key={track.url}
      href={track.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/20 transition-all group"
    >
      <div className="relative h-12 w-12 flex-shrink-0 rounded-lg overflow-hidden border border-white/10">
        <img src={track.image_url} alt={track.title} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <MusicNote className="text-spotify-green text-xs" />
        </div>
      </div>
      <div className="flex-1 min-w-0 text-left">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black text-spotify-green/60">#{index + 1}</span>
          <p className="text-sm font-bold text-white truncate">{track.title}</p>
        </div>
        <p className="text-xs text-white/50 truncate">{track.artist}</p>
      </div>
    </a>
  );

  const renderPlaylistCard = (playlist, index) => (
    <a
      key={playlist.url}
      href={playlist.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/20 transition-all group"
    >
      <div className="relative h-12 w-12 flex-shrink-0 rounded-lg overflow-hidden border border-white/10">
        {playlist.image_url ? (
          <img src={playlist.image_url} alt={playlist.name} className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full bg-white/5 flex items-center justify-center">
            <List className="text-white/20" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0 text-left">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black text-blue-400/60">#{index + 1}</span>
          <p className="text-sm font-bold text-white truncate">{playlist.name}</p>
        </div>
        <p className="text-xs text-white/50 truncate">{playlist.tracks_count} tracks</p>
      </div>
    </a>
  );

  return (
    <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="relative flex items-center justify-center py-4">
        <div className="absolute h-[1px] w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <span className="relative z-10 px-4 bg-[#0a0a0a] text-[10px] font-black uppercase tracking-[0.4em] text-white/30">
          Your Spotify Stats
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <MusicNote className="text-spotify-green text-sm" />
            <h3 className="text-xs font-black uppercase tracking-widest text-white/40">Top 5 Tracks</h3>
          </div>
          <div className="grid gap-2">
            {topTracks?.map((track, i) => renderTrackCard(track, i))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <List className="text-blue-400 text-sm" />
            <h3 className="text-xs font-black uppercase tracking-widest text-white/40">Top 5 Playlists</h3>
          </div>
          <div className="grid gap-2">
            {topPlaylists?.map((playlist, i) => renderPlaylistCard(playlist, i))}
          </div>
        </div>
      </div>
    </div>
  );
}
