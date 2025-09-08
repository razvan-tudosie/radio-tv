// src/App.tsx
import { useEffect, useRef, useState } from "react";
import type { Station } from "./types";
import { searchStations, resolveStreamUrl } from "./api/radioBrowser";
import { StationList } from "./components/StationList";

const DEFAULT_COUNTRY = "Romania";

export default function App() {
  const isTV = typeof window !== "undefined" && !!window.webapis?.avplay;

  // UI state
  const [query, setQuery] = useState("");
  const [country, setCountry] = useState(DEFAULT_COUNTRY);
  const [loading, setLoading] = useState(false);
  const [stations, setStations] = useState<Station[]>([]);
  const [focused, setFocused] = useState(0);
  const [status, setStatus] = useState<"Idle" | "Buffering" | "Playing" | "Paused" | "Stopped" | "Ended" | "Error">("Idle");
  const [muted, setMuted] = useState(false);
  const [vol, setVol] = useState(10);

  // browser audio element (for desktop dev)
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // ------------------------------
  // Fetch stations (debounced)
  // ------------------------------
  useEffect(() => {
    let alive = true;
    setLoading(true);
    const id = setTimeout(async () => {
      try {
        const data = await searchStations({ query, country, limit: 50 });
        if (!alive) return;
        setStations(data);
        setFocused(0);
      // inside useEffect that fetches stations
      } catch (e: any) {
        console.error(e);
        alert(`Radio Browser error:\n${e?.message || e}`);
      } finally {
        if (alive) setLoading(false);
      }
    }, 300); // debounce
    return () => {
      alive = false;
      clearTimeout(id);
    };
  }, [query, country]);

  // --------------------------
  // Browser (<audio>) controls
  // --------------------------
  function playWeb(url: string) {
    const a = audioRef.current;
    if (!a) return;
    a.src = url;
    a.play()
      .then(() => setStatus("Playing"))
      .catch((e) => {
        console.error(e);
        setStatus("Error");
      });
  }
  function pauseWeb() {
    const a = audioRef.current;
    if (!a) return;
    a.pause();
    setStatus("Paused");
  }
  function stopWeb() {
    const a = audioRef.current;
    if (!a) return;
    a.pause();
    a.removeAttribute("src");
    a.load();
    setStatus("Stopped");
  }
  function toggleMuteWeb() {
    const a = audioRef.current;
    if (!a) return;
    a.muted = !a.muted;
    setMuted(a.muted);
  }

  // --------------------------
  // Samsung TV (AVPlay) controls
  // --------------------------
  function openAndPlayTV(url: string) {
    const av = window.webapis.avplay;
    try { av.stop(); } catch {}
    av.open(url);
    av.setDisplayRect(0, 0, 1, 1);
    av.setListener({
      onbufferingstart: () => setStatus("Buffering"),
      onbufferingcomplete: () => setStatus("Playing"),
      onstreamcompleted: () => setStatus("Ended"),
      onerror: (e: unknown) => {
        console.error("AVPlay error", e);
        setStatus("Error");
      },
    });
    av.prepareAsync(
      () => av.play(),
      (e: unknown) => {
        console.error("AVPlay prepare error", e);
        setStatus("Error");
      }
    );
  }
  function pauseTV() { try { window.webapis.avplay.pause(); setStatus("Paused"); } catch {} }
  function stopTV()  { try { window.webapis.avplay.stop(); setStatus("Stopped"); } catch {} }
  function resumeTV(){ try { window.webapis.avplay.play();  setStatus("Playing"); } catch {} }
  function setVolumeTV(v: number) {
    try {
      const ac = window.tizen.tvaudiocontrol;
      const clamped = Math.max(0, Math.min(100, v));
      ac.setVolume(clamped);
      setVol(ac.getVolume());
    } catch {}
  }
  function volUpTV()   { setVolumeTV(vol + 5); }
  function volDownTV() { setVolumeTV(vol - 5); }
  function toggleMuteTV() {
    try {
      const ac = window.tizen.tvaudiocontrol;
      ac.setMute(!muted);
      setMuted(ac.isMute());
    } catch {}
  }

  // --------------------------
  // Unified actions
  // --------------------------
  function playStation(s: Station) {
    const stream = resolveStreamUrl(s);
    if (!stream) { setStatus("Error"); return; }
    isTV ? openAndPlayTV(stream) : playWeb(stream);
  }
  const onPause = () => (isTV ? pauseTV() : pauseWeb());
  const onStop  = () => (isTV ? stopTV()  : stopWeb());
  const onMute  = () => (isTV ? toggleMuteTV() : toggleMuteWeb());
  const onVolUp   = () => (isTV ? volUpTV()   : audioRef.current && (audioRef.current.volume = Math.min(1, audioRef.current.volume + 0.1)));
  const onVolDown = () => (isTV ? volDownTV() : audioRef.current && (audioRef.current.volume = Math.max(0, audioRef.current.volume - 0.1)));

  // Remote keys (Left/Right focus; OK/Play starts)
  useEffect(() => {
    if (isTV) {
      try {
        window.tizen.tvinputdevice.registerKey("MediaPlay");
        window.tizen.tvinputdevice.registerKey("MediaPause");
        window.tizen.tvinputdevice.registerKey("MediaStop");
        window.tizen.tvinputdevice.registerKey("VolumeUp");
        window.tizen.tvinputdevice.registerKey("VolumeDown");
        window.tizen.tvinputdevice.registerKey("Mute");
      } catch {}
    }
    const onKey = (e: KeyboardEvent) => {
      switch (e.keyCode) {
        case 37: // Left
          setFocused(f => Math.max(0, f - 1));
          break;
        case 39: // Right
          setFocused(f => Math.min(stations.length - 1, f + 1));
          break;
        case 13:  // OK
        case 415: // Play
        case 32:  // Space (desktop)
          stations[focused] && playStation(stations[focused]);
          break;
        case 19:  // Pause
          onPause();
          break;
        case 413: // Stop
          onStop();
          break;
        case 447: // Vol+
          onVolUp();
          break;
        case 448: // Vol-
          onVolDown();
          break;
        case 449: // Mute
          onMute();
          break;
        case 10009: // Return
          try { window.tizen.application.getCurrentApplication().exit(); } catch {}
          break;
        default:
          break;
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isTV, stations, focused]);

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <h1 className="text-3xl font-semibold">Radio Browser • MP3/AAC</h1>

        {/* search bar */}
        <div className="flex gap-3 flex-wrap">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 min-w-[240px] rounded-lg bg-zinc-900 border border-zinc-700 px-4 py-3 outline-none focus:border-sky-500"
            placeholder="Search stations by name (e.g., rock, europa, jazz)"
          />
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="rounded-lg bg-zinc-900 border border-zinc-700 px-4 py-3 outline-none focus:border-sky-500"
          >
            <option>Romania</option>
            <option>United Kingdom</option>
            <option>United States</option>
            <option>France</option>
            <option>Germany</option>
            <option>Spain</option>
            <option>Italy</option>
            <option>Netherlands</option>
            <option>Poland</option>
            <option>Greece</option>
            <option value="">All countries</option>
          </select>
          <button
            onClick={() => { /* re-trigger useEffect by “changing” query */ setQuery(q => q.trim()); }}
            className="px-6 py-3 rounded-lg bg-sky-600 hover:bg-sky-500 active:bg-sky-700"
          >
            Search
          </button>
        </div>

        {/* status */}
        <div className="text-zinc-400">{loading ? "Loading stations…" : `Found ${stations.length} stations`}</div>

        {/* list */}
        <StationList
          stations={stations}
          focusedIndex={focused}
          onPlayClick={(s) => playStation(s)}
        />

        {/* transport controls */}
        <div className="flex gap-3 flex-wrap items-center pt-2">
          <button onClick={() => stations[focused] && playStation(stations[focused])} className="px-6 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500">Play</button>
          <button onClick={onPause} className="px-6 py-3 rounded-lg bg-amber-600 hover:bg-amber-500">Pause</button>
          <button onClick={onStop}  className="px-6 py-3 rounded-lg bg-rose-600 hover:bg-rose-500">Stop</button>
          <button onClick={onMute}  className="px-6 py-3 rounded-lg bg-slate-700">{muted ? "Unmute" : "Mute"}</button>
          {isTV && (
            <>
              <button onClick={onVolDown} className="px-6 py-3 rounded-lg bg-slate-700">Vol −</button>
              <button onClick={onVolUp}   className="px-6 py-3 rounded-lg bg-slate-700">Vol +</button>
              <span className="text-zinc-300 ml-2">Vol: {vol}</span>
            </>
          )}
          <span className="text-zinc-400 ml-auto">Status: {status}</span>
        </div>
      </div>

      {/* browser-only audio element */}
      {!isTV && <audio ref={audioRef} preload="none" />}
    </div>
  );
}