import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { Station } from "../types";

export type PlayerStatus = "Idle" | "Buffering" | "Playing" | "Paused" | "Stopped" | "Ended" | "Error";

type Ctx = {
  isTV: boolean;
  status: PlayerStatus;
  muted: boolean;
  vol: number;
  currentUrl: string | null;
  currentStation: Pick<Station, "name" | "favicon" | "stationuuid"> | null;
  play: (url: string, station?: Pick<Station, "name" | "favicon" | "stationuuid">) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  muteToggle: () => void;
  volUp: () => void;
  volDown: () => void;
};

const PlayerContext = createContext<Ctx | null>(null);

export const usePlayer = () => {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used inside <PlayerProvider>");
  return ctx;
};

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const isTV = typeof window !== "undefined" && !!window.webapis?.avplay;
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [status, setStatus] = useState<PlayerStatus>("Idle");
  const [muted, setMuted] = useState(false);
  const [vol, setVol] = useState(10);
  const [currentUrl, setCurrentUrl] = useState<string | null>(null);
  const [currentStation, setCurrentStation] = useState<Pick<Station, "name" | "favicon" | "stationuuid"> | null>(null);

  // ---------------- Browser (<audio>) ----------------
  function playWeb(url: string) {
    const a = audioRef.current; if (!a) return;
    if (currentUrl !== url) { a.src = url; setCurrentUrl(url); }
    a.play().then(()=>setStatus("Playing")).catch((e)=>{ console.error(e); setStatus("Error"); });
  }
  function pauseWeb() { const a = audioRef.current; if (!a) return; a.pause(); setStatus("Paused"); }
  function resumeWeb() { const a = audioRef.current; if (!a) return; a.play().then(()=>setStatus("Playing")).catch(()=>setStatus("Error")); }
  function stopWeb() {
    const a = audioRef.current; if (!a) return;
    a.pause(); a.removeAttribute("src"); a.load();
    setStatus("Stopped"); setCurrentUrl(null);
  }
  function muteToggleWeb() { const a = audioRef.current; if (!a) return; a.muted = !a.muted; setMuted(a.muted); }

  // ---------------- Samsung TV (AVPlay) --------------
  function openAndPlayTV(url: string) {
    const av = window.webapis.avplay;
    try { av.stop(); } catch {}
    av.open(url);
    av.setDisplayRect(0,0,1,1); // audio-only tiny rect
    av.setListener({
      onbufferingstart: ()=>setStatus("Buffering"),
      onbufferingcomplete: ()=>setStatus("Playing"),
      onstreamcompleted: ()=>setStatus("Ended"),
      onerror: (e: unknown)=>{ console.error("AVPlay error", e); setStatus("Error"); },
    });
    av.prepareAsync(()=>av.play(), ()=>setStatus("Error"));
  }
  function pauseTV()  { try { window.webapis.avplay.pause(); setStatus("Paused"); } catch {} }
  function resumeTV() { try { window.webapis.avplay.play();  setStatus("Playing"); } catch {} }
  function stopTV()   { try { window.webapis.avplay.stop();  setStatus("Stopped"); setCurrentUrl(null);} catch {} }
  function setVolumeTV(v:number){
    try { const ac = window.tizen.tvaudiocontrol; const c = Math.max(0, Math.min(100, v));
      ac.setVolume(c); setVol(ac.getVolume()); } catch {}
  }
  function volUpTV(){ setVolumeTV(vol+5); }
  function volDownTV(){ setVolumeTV(vol-5); }
  function muteToggleTV(){ try { const ac = window.tizen.tvaudiocontrol; ac.setMute(!muted); setMuted(ac.isMute()); } catch {} }

  // ---------------- Unified API ----------------------
  const play = (url: string, station?: Pick<Station,"name"|"favicon"|"stationuuid">) => {
    if (station) setCurrentStation(station);
    isTV ? openAndPlayTV(url) : playWeb(url);
  };
  const pause = () => (isTV ? pauseTV() : pauseWeb());
  const resume = () => (isTV ? resumeTV() : resumeWeb());
  const stop = () => { isTV ? stopTV() : stopWeb(); setCurrentStation(null); };
  const muteToggle = () => (isTV ? muteToggleTV() : muteToggleWeb());
  const volUp = () => (isTV ? volUpTV() : audioRef.current && (audioRef.current.volume = Math.min(1, audioRef.current.volume + 0.1)));
  const volDown = () => (isTV ? volDownTV() : audioRef.current && (audioRef.current.volume = Math.max(0, audioRef.current.volume - 0.1)));

  // Register TV remote media keys once
  useEffect(() => {
    if (!isTV) return;
    try {
      window.tizen.tvinputdevice.registerKey("MediaPlay");
      window.tizen.tvinputdevice.registerKey("MediaPause");
      window.tizen.tvinputdevice.registerKey("MediaStop");
      window.tizen.tvinputdevice.registerKey("VolumeUp");
      window.tizen.tvinputdevice.registerKey("VolumeDown");
      window.tizen.tvinputdevice.registerKey("Mute");
    } catch {}
    const onKey = (e: KeyboardEvent) => {
      switch (e.keyCode) {
        case 415: // Play
          currentUrl ? resume() : undefined; break;
        case 19:  // Pause
          pause(); break;
        case 413: // Stop
          stop(); break;
        case 447: // Vol+
          volUp(); break;
        case 448: // Vol-
          volDown(); break;
        case 449: // Mute
          muteToggle(); break;
        default: break;
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isTV, currentUrl, muted, vol]);

  const value = useMemo<Ctx>(()=>({
    isTV, status, muted, vol, currentUrl, currentStation,
    play, pause, resume, stop, muteToggle, volUp, volDown
  }), [isTV, status, muted, vol, currentUrl, currentStation]);

  return (
    <PlayerContext.Provider value={value}>
      {children}
      {/* Hidden once-per-app audio element for browser dev */}
      {!isTV && <audio ref={audioRef} preload="none" />}
    </PlayerContext.Provider>
  );
}