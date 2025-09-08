import { useEffect, useState } from "react";
import type { Station } from "../types";
import { searchStations, resolveStreamUrl } from "../api/radioBrowser";
import { StationGrid } from "../components/StationGrid";
import { usePlayer } from "../player/PlayerProvider";
import { useCountry } from "../prefs/CountryProvider";

export default function Home() {
  const { status, play } = usePlayer();
  const { country } = useCountry();
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const list = await searchStations({
          country: country || "", // "" means all countries
          limit: 10,
        });
        if (alive) setStations(list);
      } catch (e: any) {
        if (alive) setError(e?.message || "Failed to load stations");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [country]); // reload when user changes country

  const onPlay = (s: Station) => {
    const url = resolveStreamUrl(s);
    if (!url) return;
    play(url, { name: s.name, favicon: s.favicon, stationuuid: s.stationuuid });
  };

  return (
    <div className="space-y-6">
      <header className="flex items-baseline gap-3">
        <h1 className="text-3xl font-semibold">Home</h1>
        <span className="text-zinc-400 text-sm">Status: {status}</span>
        <span className="ml-auto text-zinc-400 text-sm">
          Country: {country || "All countries"}
        </span>
      </header>

      {loading && <div className="text-zinc-400">Loading stations…</div>}
      {error && <div className="text-rose-400">{error}</div>}

      {!loading && !error && (
        <StationGrid stations={stations} onPlay={onPlay} />
      )}
    </div>
  );
}