import { usePlayer } from "../player/PlayerProvider";

export function PlayerWidget() {
  const { status, muted, vol, currentStation, pause, resume, stop, muteToggle, volDown, volUp } = usePlayer();

  return (
    <div className="flex items-center gap-3 bg-zinc-900/80 border border-zinc-800 rounded-xl px-3 py-2">
      <div className="w-8 h-8 rounded-md bg-zinc-800 overflow-hidden grid place-items-center">
        {currentStation?.favicon ? (
          <img src={currentStation.favicon} alt="" className="w-8 h-8 object-contain" />
        ) : (
          <div className="w-4 h-4 rounded-full bg-zinc-700" />
        )}
      </div>
      <div className="min-w-[140px] max-w-[220px] truncate text-sm">
        {currentStation?.name ?? "No station"}
        <div className="text-[11px] text-zinc-400">Status: {status}</div>
      </div>

      <div className="hidden md:flex items-center gap-2">
        <button onClick={resume} className="px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-sm">Play</button>
        <button onClick={pause}  className="px-2 py-1 rounded bg-amber-600  hover:bg-amber-500  text-sm">Pause</button>
        <button onClick={stop}   className="px-2 py-1 rounded bg-rose-600   hover:bg-rose-500   text-sm">Stop</button>
      </div>

      <div className="hidden md:flex items-center gap-2 text-sm text-zinc-300">
        <button onClick={volDown} className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700">−</button>
        <span className="w-8 text-center">{vol}</span>
        <button onClick={volUp}   className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700">+</button>
        <button onClick={muteToggle} className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700">
          {muted ? "Unmute" : "Mute"}
        </button>
      </div>
    </div>
  );
}