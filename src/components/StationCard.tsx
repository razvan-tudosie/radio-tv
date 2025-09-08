// src/components/StationCard.tsx
import type { Station } from "../types";

export function StationCard({ s, onPlay }: { s: Station; onPlay: (s: Station)=>void }) {
  return (
    <button
      onClick={()=>onPlay(s)}
      className="text-left bg-zinc-900 border border-zinc-800 rounded-2xl p-4 hover:border-zinc-700 transition"
    >
      <div className="aspect-square rounded-xl bg-black grid place-items-center overflow-hidden mb-3">
        {s.favicon ? (
          <img src={s.favicon} alt="" className="w-24 h-24 object-contain opacity-90" />
        ) : (
          <div className="w-24 h-24 rounded-full bg-zinc-800" />
        )}
      </div>
      <div className="font-semibold text-lg truncate">{s.name}</div>
      <div className="text-xs text-zinc-500 mt-1">{(s.codec || "").toUpperCase()} • {s.bitrate || 0} kbps</div>
    </button>
  );
}