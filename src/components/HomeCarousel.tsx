import { useEffect, useMemo, useRef, useState } from "react";
import type { Station } from "../types";

type Props = {
    stations: Station[];
    onPlay: (s: Station) => void;
    onCenterChange?: (s: Station, index: number) => void;

    // Visual knobs
    spacing?: number;          // base spacing; ensures non-overlap (used in autoSpacing)
    centerScale?: number;      // scale for center disc
    stepScaleDrop?: number;    // shrink per step away from center
    minScale?: number;         // min scale for far discs
    maxVisibleSteps?: number;  // how many neighbors each side remain “prominent”

    // Sizes (for non-overlap calc)
    centerSize?: number;       // diameter (px) for center disc (unscaled)
    sideSize?: number;         // diameter (px) for side discs (unscaled)
    gap?: number;              // extra padding used by auto-spacing calc

    // Progressive gaps (edge-to-edge), in addition to autoSpacing
    centerGap?: number;        // gap between center and first neighbor
    smallGap?: number;         // gap between small neighbors
};

export default function HomeCarousel({
    stations,
    onPlay,
    onCenterChange,
    spacing = 240,
    centerScale = 1.5,
    stepScaleDrop = 0.2,
    minScale = 0.55,
    maxVisibleSteps = 5,
    centerSize = 240,
    sideSize = 170,
    gap = 0,
    centerGap = 52,
    smallGap = 0,
}: Props) {
    const [idx, setIdx] = useState(0);
    const n = stations.length;
    const rootRef = useRef<HTMLDivElement | null>(null);

    // wrap index safely
    const wrap = (i: number) => (n > 0 ? ((i % n) + n) % n : 0);

    const items = useMemo(() => stations.map((s, i) => ({ s, i })), [stations]);

    // keep index valid when list size changes
    useEffect(() => {
        setIdx((prev) => (n > 0 ? Math.min(Math.max(0, prev), n - 1) : 0));
    }, [n]);

    // notify parent on center change
    useEffect(() => {
        if (n === 0 || !onCenterChange) return;
        const i = Number.isFinite(idx) ? idx : 0;
        const s = stations[i];
        if (s) onCenterChange(s, i);
    }, [idx, n, stations, onCenterChange]);

    const goLeft = () => { if (n > 0) setIdx((i) => wrap(i - 1)); };
    const goRight = () => { if (n > 0) setIdx((i) => wrap(i + 1)); };

    // keyboard: arrows move, Enter/OK plays center
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (n === 0) return;
            switch (e.keyCode) {
                case 37: goLeft(); break;   // Left
                case 39: goRight(); break;  // Right
                case 13:                // Enter / OK
                case 415:               // MediaPlay (TV)
                    stations[idx] && onPlay(stations[idx]);
                    break;
                default: break;
            }
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [idx, n, stations, onPlay]);

    // hold-to-repeat for ◀ ▶
    useEffect(() => {
        if (n === 0) return;
        let timer: number | null = null;
        let held: -1 | 1 | null = null;

        const down = (e: KeyboardEvent) => {
            if (held !== null) return;
            if (e.keyCode === 37) { held = -1; goLeft(); }
            else if (e.keyCode === 39) { held = 1; goRight(); }
            else return;
            timer = window.setInterval(() => (held === -1 ? goLeft() : goRight()), 160);
        };
        const up = (e: KeyboardEvent) => {
            if ((e.keyCode === 37 && held === -1) || (e.keyCode === 39 && held === 1)) {
                if (timer) clearInterval(timer);
                timer = null; held = null;
            }
        };

        document.addEventListener("keydown", down);
        document.addEventListener("keyup", up);
        return () => {
            document.removeEventListener("keydown", down);
            document.removeEventListener("keyup", up);
            if (timer) clearInterval(timer);
        };
    }, [n]);

    // optional: horizontal wheel scroll
    useEffect(() => {
        const el = rootRef.current;
        if (!el || n === 0) return;
        const onWheel = (e: WheelEvent) => {
            if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
                e.preventDefault();
                e.deltaX > 0 ? goRight() : goLeft();
            }
        };
        el.addEventListener("wheel", onWheel, { passive: false });
        return () => el.removeEventListener("wheel", onWheel);
    }, [n]);

    // --- spacing logic ---

    // safe base spacing so discs don't overlap, regardless of scale
    const neighborScale = Math.max(minScale, centerScale - 1 * stepScaleDrop);
    const required = (centerSize * centerScale + sideSize * neighborScale) / 2 + gap;
    const autoSpacing = Math.max(spacing, required);

    // progressive offsets: bigger gap from center→first, tighter between smalls
    function offsetFor(slot: number) {
        if (slot === 0) return 0;
        const dir = slot < 0 ? -1 : 1;
        const steps = Math.abs(slot);
        let dist = 0;
        for (let i = 1; i <= steps; i++) {
            dist += autoSpacing + (i === 1 ? centerGap : smallGap);
        }
        return dist * dir;
    }

    // per-slot transform/appearance
    function styleFor(slot: number) {
        const step = Math.abs(slot);
        const x = offsetFor(slot);
        const scale =
            slot === 0 ? centerScale : Math.max(minScale, centerScale - step * stepScaleDrop);
        const opacity = slot === 0 ? 1 : step <= maxVisibleSteps ? 0.92 - step * 0.12 : 0.12;
        const blur = step >= maxVisibleSteps ? 2 : 0;
        const z = 100 - step;

        return {
            transform: `translateX(${x}px) translateX(-50%) scale(${scale})`,
            opacity,
            filter: blur ? `blur(${blur}px)` : undefined,
            zIndex: z,
        } as React.CSSProperties;
    }

    const safeIdx = Number.isFinite(idx) ? idx : 0;

    return (
        <div ref={rootRef} className="relative w-full h-[460px] select-none overflow-hidden">
            <div className="absolute inset-0">
                {items.map(({ s, i }) => {
                    let slot = i - safeIdx;
                    if (n > 0) {
                        if (slot > n / 2) slot -= n;
                        if (slot < -n / 2) slot += n;
                    }

                    const hidden = Math.abs(slot) > maxVisibleSteps + 2;
                    const baseSize = slot === 0 ? centerSize : sideSize;

                    return (
                        <button
                            key={s.stationuuid}
                            onClick={() => (slot === 0 ? onPlay(s) : setIdx(wrap(i)))}
                            aria-label={s.name}
                            className={`absolute top-1/2 left-1/2 -translate-y-1/2 transition-transform duration-300 ease-out
                         ${hidden ? "pointer-events-none opacity-0" : ""}`}
                            style={styleFor(slot)}
                        >
                            <div
                                className="relative rounded-full bg-white shadow-[0_10px_40px_rgba(0,0,0,.35)] flex items-center justify-center"
                                style={{ width: baseSize, height: baseSize }}
                            >
                                {s.favicon ? (
                                    <img
                                        src={s.favicon}
                                        alt=""
                                        className="object-contain"
                                        style={{ width: "70%", height: "70%" }}
                                        loading="lazy"
                                        decoding="async"
                                        draggable={false}
                                    />
                                ) : (
                                    <div
                                        className="rounded-full bg-zinc-200 grid place-items-center text-3xl font-semibold text-zinc-700 select-none"
                                        style={{ width: "70%", height: "70%" }}
                                    >
                                        {(s.name || "?")
                                            .replace(/[^\p{L}\p{N} ]/gu, "")
                                            .split(" ")
                                            .slice(0, 2)
                                            .map((w) => w[0])
                                            .join("")}
                                    </div>
                                )}

                                {slot === 0 && (
                                    <>
                                        <span className="pointer-events-none absolute inset-0 rounded-full ring-2 ring-white/80" />
                                        <span className="pointer-events-none absolute inset-[10px] rounded-full ring-2 ring-white/40" />
                                    </>
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* optional click zones for mouse/TV pointer */}
            <div className="absolute inset-y-0 left-0 w-1/5" onClick={goLeft} />
            <div className="absolute inset-y-0 right-0 w-1/5" onClick={goRight} />
        </div>
    );
}