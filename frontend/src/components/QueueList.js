import React from "react";
import QueueMusic from "@mui/icons-material/QueueMusic";

export default function QueueList({ queue }) {
  if (!queue || queue.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 opacity-20 text-center">
        <QueueMusic sx={{ fontSize: 40, mb: 1 }} />
        <p className="text-xs font-black uppercase tracking-widest">Queue is empty</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center gap-2 px-1">
        <QueueMusic className="text-[var(--accent-primary)] text-sm" />
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Upcoming Tracks</h3>
      </div>
      
      <div className="grid gap-2">
        {queue.map((track, index) => (
          <div
            key={`${track.id}-${index}`}
            className="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all group"
          >
            <div className="relative h-10 w-10 flex-shrink-0 rounded-lg overflow-hidden border border-white/10">
              <img src={track.image_url || "https://via.placeholder.com/100"} alt={track.title} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-[10px] font-black text-[var(--accent-primary)]">#{index + 1}</span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">{track.title}</p>
              <p className="text-xs text-white/50 truncate">{track.artist}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
