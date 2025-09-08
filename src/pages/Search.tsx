import { useEffect, useMemo, useState } from "react";
import type { Station } from "../types";
import {
    listCountries,
    listTags,
    resolveStreamUrl,
    searchStations,
} from "../api/radioBrowser";
import { StationGrid } from "../components/StationGrid";
import { usePlayer } from "../player/PlayerProvider";
import { useCountry } from "../prefs/CountryProvider";

export default function Search() {
    // ⬇️ read the globally-selected country (navbar modal)
    const { country: globalCountry } = useCountry();

    // form state
    const [q, setQ] = useState("");
    // ⬇️ initialize with global country and keep in sync if it changes
    const [country, setCountry] = useState<string>(globalCountry);
    useEffect(() => { setCountry(globalCountry); }, [globalCountry]);

    const [tag, setTag] = useState<string>("");

    // dropdown data
    const [countries, setCountries] = useState<string[]>([]);
    const [tags, setTags] = useState<string[]>([]);

    // results
    const [loading, setLoading] = useState(false);
    const [stations, setStations] = useState<Station[]>([]);
    const [error, setError] = useState<string | null>(null);

    // global player
    const {play } = usePlayer();

    // load filters once (dedupe + sort + Romania pinned first)
    useEffect(() => {
        (async () => {
            const [cList, tList] = await Promise.all([listCountries(), listTags(150)]);

            const uniqueCountries = Array.from(new Set(cList));
            const uniqueTags = Array.from(new Set(tList));

            const sortedCountries = uniqueCountries.sort((a, b) => {
                if (a === "Romania") return -1;
                if (b === "Romania") return 1;
                return a.localeCompare(b);
            });

            const sortedTags = uniqueTags.sort((a, b) => a.localeCompare(b));

            setCountries(sortedCountries);
            setTags(sortedTags);
        })();
    }, []);

    async function runSearch() {
        setLoading(true);
        setError(null);
        try {
            const results = await searchStations({
                query: q.trim(),
                country: country || "", // "" = all countries
                tag: tag || "",
                limit: 50,
            });
            setStations(results);
        } catch (e: any) {
            console.error(e);
            setError(e?.message || "Search error. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    const onPlay = (s: Station) => {
        const url = resolveStreamUrl(s);
        if (!url) return;
        play(url, { name: s.name, favicon: s.favicon, stationuuid: s.stationuuid });
    };

    const searchDisabled = useMemo(
        () => loading || countries.length === 0 || tags.length === 0,
        [loading, countries.length, tags.length]
    );

    function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === "Enter" && !searchDisabled) runSearch();
    }

    return (
        <div className="space-y-6">
            {/* <header className="flex items-baseline gap-3">
                <h1 className="text-3xl font-semibold">Search</h1>
                <span className="text-zinc-400 text-sm">Status: {status}</span>
            </header> */}

            {/* Controls */}
            <div className="flex flex-wrap gap-3">
                <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    onKeyDown={onKeyDown}
                    className="flex-1 min-w-[240px] rounded-lg bg-zinc-900 border border-zinc-700 px-4 py-3 outline-none focus:border-sky-500"
                    placeholder="Keyword (e.g., rock, europa, jazz)"
                />

                <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="rounded-lg bg-zinc-900 border border-zinc-700 px-4 py-3 outline-none focus:border-sky-500"
                >
                    <option key="country-all" value="">
                        All countries
                    </option>
                    {countries.map((c) => (
                        <option key={`country-${c}`} value={c}>
                            {c}
                        </option>
                    ))}
                </select>

                <select
                    value={tag}
                    onChange={(e) => setTag(e.target.value)}
                    className="rounded-lg bg-zinc-900 border border-zinc-700 px-4 py-3 outline-none focus:border-sky-500"
                >
                    <option key="tag-all" value="">
                        All tags
                    </option>
                    {tags.map((t) => (
                        <option key={`tag-${t}`} value={t}>
                            {t}
                        </option>
                    ))}
                </select>

                <button
                    onClick={runSearch}
                    disabled={searchDisabled}
                    className={`px-6 py-3 rounded-lg ${searchDisabled
                            ? "bg-sky-900/50 text-sky-200/50 cursor-not-allowed"
                            : "bg-sky-600 hover:bg-sky-500 active:bg-sky-700"
                        }`}
                >
                    {loading ? "Searching…" : "Search"}
                </button>
            </div>

            {/* Results / messages */}
            {error && <div className="text-rose-400">{error}</div>}

            {stations.length > 0 ? (
                <StationGrid stations={stations} onPlay={onPlay} />
            ) : (
                !loading &&
                !error && (
                    <div className="text-zinc-400">
                        No results yet. Try a keyword, country, or tag.
                    </div>
                )
            )}

            {loading && <div className="text-zinc-400">Fetching stations…</div>}
        </div>
    );
}