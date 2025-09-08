import { useMemo } from "react";
import { usePlayer } from "../player/PlayerProvider";

export function PlayerWidget() {
    const { status, currentStation, resume, pause, currentUrl } = usePlayer();

    const isPlaying = status === "Playing" || status === "Buffering";
    const canPlay = !!currentUrl; // we can resume only after a station was started

    // button label + handler based on state
    const action = useMemo(() => {
        if (isPlaying) {
            return { label: "Pause", onClick: pause, disabled: false };
        }
        return { label: "Play", onClick: resume, disabled: !canPlay };
    }, [isPlaying, pause, resume, canPlay]);

    return (
        <div className="flex items-center gap-3 bg-zinc-900/80 border border-zinc-800 rounded-xl px-3 py-2">
            <div className="relative w-8 h-8 rounded-md bg-zinc-800 overflow-hidden grid place-items-center">
                {currentStation?.favicon ? (
                    <img src={currentStation.favicon} alt="" className="w-8 h-8 object-contain" />
                ) : (
                    <div className="w-4 h-4 rounded-full bg-zinc-700" />
                )}

                {/* live dot when playing */}
                {isPlaying && (
                    <span className="absolute -right-1 -top-1 inline-flex h-3 w-3">
                        <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
                    </span>
                )}
            </div>

            <div className="min-w-[140px] max-w-[220px] truncate text-sm">
                {currentStation?.name ?? "No station"}
                <div className="text-[11px] text-zinc-400">Status: {status}</div>
            </div>

            <button
                onClick={action.onClick}
                disabled={action.disabled}
                className={`px-3 py-1.5 rounded-lg text-sm ${action.disabled
                        ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                        : isPlaying
                            ? "bg-amber-600 hover:bg-amber-500"
                            : "bg-emerald-600 hover:bg-emerald-500"
                    }`}
            >
                {action.label}
            </button>
        </div>
    );
}