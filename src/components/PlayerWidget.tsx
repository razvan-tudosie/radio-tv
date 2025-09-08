import { useEffect, useMemo, useRef } from "react";
import { usePlayer } from "../player/PlayerProvider";
import LiveIcon from "../assets/live";
import Play_circle_40 from "../assets/Play_circle_40";
import Pause_circle from "../assets/Pause_circle";

export function PlayerWidget() {
    const { status, currentStation, currentUrl, resume, pause } = usePlayer();

    const isPlaying = status === "Playing" || status === "Buffering";
    const canPlay = !!currentUrl;

    type UIState = "none" | "paused" | "playing";
    const ui = useMemo(() => {
        if (!canPlay) {
            return { state: "none" as UIState, label: "No station", onClick: () => { }, disabled: true };
        }
        if (isPlaying) {
            return { state: "playing" as UIState, label: "Pause", onClick: pause, disabled: false };
        }
        return { state: "paused" as UIState, label: "Play", onClick: resume, disabled: false };
    }, [canPlay, isPlaying, pause, resume]);

    // optional codec/bitrate line
    const codec = (currentStation as any)?.codec ? String((currentStation as any).codec).toUpperCase() : "";
    const bitrate = (currentStation as any)?.bitrate ? `${(currentStation as any).bitrate} kbps` : "";
    const meta = codec || bitrate ? [codec, bitrate].filter(Boolean).join(" • ") : "";

    // Ensure TV 'Play' key also triggers click (buttons already handle Enter)
    const btnRef = useRef<HTMLButtonElement | null>(null);
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.keyCode === 415 && btnRef.current && !ui.disabled) {
                e.preventDefault();
                btnRef.current.click();
            }
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [ui.disabled]);

    return (
        <button
            ref={btnRef}
            type="button"
            onClick={ui.onClick}
            disabled={ui.disabled}
            aria-label={ui.label}
            className={[
                // layout
                "flex items-center gap-4 rounded-3xl px-4 py-3",
                "w-full md:w-auto",
                // visuals
                "bg-white/5 border border-white/10 backdrop-blur transition",
                ui.disabled ? "opacity-60 cursor-not-allowed" : "hover:bg-white/7",
                // focus highlight for TV/keyboard
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:border-white",
            ].join(" ")}
        >
            {/* Logo */}
            <div className="w-12 h-12 rounded-xl bg-zinc-800/70 overflow-hidden grid place-items-center shrink-0">
                {currentStation?.favicon ? (
                    <img
                        src={currentStation.favicon}
                        alt=""
                        className="w-12 h-12 object-contain"
                        loading="lazy"
                        decoding="async"
                    />
                ) : (
                    <div className="w-6 h-6 rounded-md bg-zinc-700" />
                )}
            </div>

            {/* Title + meta */}
            <div className="min-w-[180px] max-w-[280px] flex-1 text-left">
                <div
                    className={[
                        "font-semibold truncate text-[18px] leading-6",
                        ui.state === "none" ? "text-zinc-400" : "text-white",
                    ].join(" ")}
                    title={currentStation?.name || "No station"}
                >
                    {currentStation?.name ?? "No station"}
                </div>
                <div className="text-[13px] text-zinc-400 truncate">
                    {ui.state === "none" ? "Select a station to play" : meta || " "}
                </div>
            </div>

            {/* Status column (centered vertically) */}
            <div className="flex items-center justify-center w-[92px]">
                {ui.state === "playing" ? (
                    <span className="inline-flex items-center gap-1 text-emerald-400 text-sm">
                        Live <LiveIcon className="inline-block" />
                    </span>
                ) : ui.state === "paused" ? (
                    <span className="text-amber-400 text-sm">Paused</span>
                ) : (
                    <span className="text-zinc-500 text-sm">&nbsp;</span>
                )}
            </div>

            {/* Icon (visual only; whole widget is clickable) */}
            <span
                className={[
                    "shrink-0 rounded-full",
                    ui.disabled ? "opacity-40" : "",
                ].join(" ")}
            >
                {ui.state === "playing" ? (
                    <Pause_circle className="w-10 h-10" />
                ) : (
                    <Play_circle_40 className="w-10 h-10" />
                )}
            </span>
        </button>
    );
}