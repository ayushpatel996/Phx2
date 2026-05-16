import React, { useState } from "react";
import Search from "@mui/icons-material/Search";
import Add from "@mui/icons-material/Add";
import Close from "@mui/icons-material/Close";
import Check from "@mui/icons-material/Check";
import CircularProgress from "@mui/material/CircularProgress";
import { searchSpotify, addToQueue } from "../api/spotifyApi";

export default function SearchPanel({ onClose, onSongAdded }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addingId, setAddingId] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    const data = await searchSpotify(query);
    setResults(data);
    setLoading(false);
  };

  const handleAddToQueue = async (track) => {
    setAddingId(track.id);
    const res = await addToQueue(track.uri);
    if (res.ok) {
      if (onSongAdded) onSongAdded();
      // Show success briefly
      setTimeout(() => setAddingId(null), 2000);
      // Optional: Show a toast or notification
    } else {
      setAddingId(null);
    }
  };

  return (
    <div className="glass rounded-[2.5rem] p-6 space-y-6 animate-in fade-in zoom-in duration-300 h-[500px] flex flex-col">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/40">Add to Queue</h3>
        <button onClick={onClose} className="text-white/20 hover:text-white transition-colors">
          <Close sx={{ fontSize: 18 }} />
        </button>
      </div>

      <form onSubmit={handleSearch} className="relative group">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for tracks..."
          className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[var(--accent-primary)] focus:bg-white/10 transition-all focus:shadow-[0_0_15px_var(--accent-glow)]"
        />
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[var(--accent-primary)] transition-colors" sx={{ fontSize: 20 }} />
      </form>

      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-2">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <CircularProgress size={24} sx={{ color: 'var(--accent-primary)' }} />
          </div>
        ) : results.length > 0 ? (
          results.map((track) => (
            <div
              key={track.id}
              className="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all group"
            >
              <img 
                src={track.image_url || "https://via.placeholder.com/100"} 
                alt={track.title} 
                className="h-10 w-10 rounded-lg object-cover border border-white/10" 
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">{track.title}</p>
                <p className="text-xs text-white/50 truncate">{track.artist}</p>
              </div>
              <button
                onClick={() => handleAddToQueue(track)}
                disabled={addingId === track.id}
                className={`h-8 w-8 rounded-full flex items-center justify-center transition-all ${
                  addingId === track.id
                    ? "text-black"
                    : "bg-white/5 text-white/40 hover:text-black hover:scale-110"
                }`}
                style={{ 
                  backgroundColor: addingId === track.id ? 'var(--accent-primary)' : undefined,
                  '--hover-bg': 'var(--accent-primary)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-primary)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = addingId === track.id ? 'var(--accent-primary)' : 'rgba(255,255,255,0.05)'}
              >
                {addingId === track.id ? (
                  <Check sx={{ fontSize: 16 }} />
                ) : (
                  <Add sx={{ fontSize: 16 }} />
                )}
              </button>
            </div>
          ))
        ) : query && !loading ? (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-20">
            <p className="text-sm">No tracks found</p>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-20">
            <p className="text-sm italic">Search for your favorite beats</p>
          </div>
        )}
      </div>
    </div>
  );
}
