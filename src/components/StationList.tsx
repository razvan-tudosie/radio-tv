// src/components/StationList.tsx
import type { Station } from "../types";

export function StationList({
  stations,
  onPlayClick,
  focusedIndex,
}: {
  stations: Station[];
  onPlayClick: (s: Station) => void;
  focusedIndex: number;
}) {
  return (
    <div className="w-full overflow-x-auto">
      <div className="grid grid-flow-col auto-cols-[280px] gap-4 p-2">
        {stations.map((s, i) => (
          <button
            key={s.stationuuid}
            className={`text-left bg-zinc-900 border border-zinc-800 rounded-2xl p-4 focus:outline-none transition
                        ${i === focusedIndex ? "ring-4 ring-sky-500 scale-[1.02]" : "hover:border-zinc-700"}`}
            onClick={() => onPlayClick(s)}
          >
            <div className="aspect-square rounded-xl bg-black grid place-items-center overflow-hidden mb-3">
              {/* station logo or fallback */}
              {s.favicon ? (
                <img src={s.favicon} alt="" className="w-24 h-24 object-contain opacity-90" />
              ) : (
                <div className="w-24 h-24 rounded-full bg-zinc-800" />
              )}
            </div>
            aici
            <div className="font-semibold text-lg truncate">{s.name}</div>
            <div className="text-sm text-zinc-400">{s.country || ""}</div>
            <div className="text-xs text-zinc-500 mt-1">{(s.codec || "").toUpperCase()} • {s.bitrate || 0} kbps</div>
          </button>
        ))}
      </div>
    </div>
  );
}