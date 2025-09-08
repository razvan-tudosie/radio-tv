import { useEffect, useMemo, useState } from "react";
import { useCountry } from "../prefs/CountryProvider";
import { listCountries } from "../api/radioBrowser";

export function CountryModal() {
  const { isOpen, close, country, setCountry } = useCountry();
  const [all, setAll] = useState<string[]>([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    (async () => {
      const c = await listCountries();
      const u = Array.from(new Set(c)).sort((a, b) => a.localeCompare(b));
      setAll(u);
    })();
  }, [isOpen]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    const list = ["", ...all]; // "" = All countries
    return term
      ? list.filter(c => (c || "All countries").toLowerCase().includes(term))
      : list;
  }, [q, all]);

  function onSelect(value: string) {
    setCountry(value);
    close();
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 z-[10000] ">
      <div className="absolute inset-0 bg-black text-white p-6 md:p-10 overflow-auto">
        <header className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">Choose country</h2>
          <button
            onClick={close}
            className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700"
          >
            Close
          </button>
        </header>

        <div className="max-w-3xl mx-auto space-y-6">
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search country…"
            className="w-full rounded-lg bg-zinc-900 border border-zinc-700 px-4 py-3 outline-none focus:border-sky-500"
          />

          <div className="space-y-2 max-h-[60vh] overflow-y-auto">
            {filtered.map((c) => (
              <button
                key={`c-${c || "ALL"}`}
                onClick={() => onSelect(c)}
                className={`w-full text-left px-4 py-3 rounded-lg border ${
                  c === country
                    ? "bg-sky-600 border-sky-600"
                    : "bg-zinc-900 border-zinc-700 hover:bg-zinc-800"
                }`}
              >
                {c || "All countries"}
              </button>
            ))}

            {filtered.length === 0 && (
              <div className="text-zinc-400 text-sm px-2 py-4">
                No countries match your search.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}