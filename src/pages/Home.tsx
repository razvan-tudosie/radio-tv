import { useEffect, useState } from "react";
import type { Station } from "../types";
import { searchStations, resolveStreamUrl } from "../api/radioBrowser";
import { usePlayer } from "../player/PlayerProvider";
import { useCountry } from "../prefs/CountryProvider";
import HomeCarousel from "../components/HomeCarousel";

export default function Home() {
    const { play } = usePlayer();
    const { country } = useCountry();
    const [stations, setStations] = useState<Station[]>([]);
    const [center, setCenter] = useState<Station | null>(null);

    useEffect(() => {
        let alive = true;
        (async () => {
            const list = await searchStations({ country: country || "", limit: 20 });
            if (!alive) return;
            setStations(list);
            if (list[0]) setCenter(list[0]);
        })();
        return () => { alive = false; };
    }, [country]);

    const onPlay = (s: Station) => {
        const url = resolveStreamUrl(s);
        if (!url) return;
        play(url, { name: s.name, favicon: s.favicon, stationuuid: s.stationuuid });
    };

    return (
        <div className="space-y-6">
            {/* <header className="flex items-baseline gap-3">
        <h1 className="text-3xl font-semibold">Home</h1>
        <span className="text-zinc-400 text-sm">Status: {status}</span>
        <span className="ml-auto text-zinc-400 text-sm">Country: {country || "All countries"}</span>
      </header> */}

            <HomeCarousel
                stations={stations}
                onPlay={onPlay}
                onCenterChange={(s) => setCenter(s)}
            />

            {center && (
                <div className="text-center -mt-2">
                    <div className="text-xl font-medium">{center.name}</div>
                    <div className="text-sm text-zinc-300">
                        {(center.codec || "").toUpperCase()} • {center.bitrate || 0} kbps
                    </div>
                </div>
            )}
        </div>
    );
}