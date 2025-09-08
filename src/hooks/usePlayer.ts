// src/hooks/usePlayer.ts
import { useRef, useState } from "react";

export type PlayerStatus = "Idle" | "Buffering" | "Playing" | "Paused" | "Stopped" | "Ended" | "Error";

export function usePlayer() {
  const isTV = typeof window !== "undefined" && !!window.webapis?.avplay;
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [status, setStatus] = useState<PlayerStatus>("Idle");
  const [muted, setMuted] = useState(false);
  const [vol, setVol] = useState(10);

  // Browser
  function playWeb(url: string) {
    const a = audioRef.current; if (!a) return;
    a.src = url;
    a.play().then(()=>setStatus("Playing")).catch(()=>setStatus("Error"));
  }
  function pauseWeb() { const a=audioRef.current; if(!a) return; a.pause(); setStatus("Paused"); }
  function stopWeb()  { const a=audioRef.current; if(!a) return; a.pause(); a.removeAttribute("src"); a.load(); setStatus("Stopped"); }
  function toggleMuteWeb(){ const a=audioRef.current; if(!a) return; a.muted=!a.muted; setMuted(a.muted); }

  // TV
  function openAndPlayTV(url: string) {
    const av = window.webapis.avplay;
    try { av.stop(); } catch {}
    av.open(url);
    av.setDisplayRect(0,0,1,1);
    av.setListener({
      onbufferingstart: ()=>setStatus("Buffering"),
      onbufferingcomplete: ()=>setStatus("Playing"),
      onstreamcompleted: ()=>setStatus("Ended"),
      onerror: ()=>setStatus("Error"),
    });
    av.prepareAsync(()=>av.play(), ()=>setStatus("Error"));
  }
  function pauseTV(){ try{ window.webapis.avplay.pause(); setStatus("Paused"); }catch{} }
  function stopTV(){ try{ window.webapis.avplay.stop(); setStatus("Stopped"); }catch{} }
  function resumeTV(){ try{ window.webapis.avplay.play(); setStatus("Playing"); }catch{} }
  function setVolumeTV(v:number){
    try{
      const ac = window.tizen.tvaudiocontrol;
      const clamped = Math.max(0, Math.min(100, v));
      ac.setVolume(clamped); setVol(ac.getVolume());
    }catch{}
  }
  function volUpTV(){ setVolumeTV(vol+5); }
  function volDownTV(){ setVolumeTV(vol-5); }
  function toggleMuteTV(){ try{ const ac=window.tizen.tvaudiocontrol; ac.setMute(!muted); setMuted(ac.isMute()); }catch{} }

  // Unified
  const play = (url:string)=> (isTV ? openAndPlayTV(url) : playWeb(url));
  const pause = ()=> (isTV ? pauseTV() : pauseWeb());
  const stop = ()=> (isTV ? stopTV() : stopWeb());
  const resume = ()=> (isTV ? resumeTV() : audioRef.current?.play());
  const muteToggle = ()=> (isTV ? toggleMuteTV() : toggleMuteWeb());
  const volUp = ()=> (isTV ? volUpTV() : audioRef.current && (audioRef.current.volume = Math.min(1, audioRef.current.volume+0.1)));
  const volDown = ()=> (isTV ? volDownTV() : audioRef.current && (audioRef.current.volume = Math.max(0, audioRef.current.volume-0.1)));

  return { isTV, audioRef, status, muted, vol, play, pause, stop, resume, muteToggle, volUp, volDown };
}