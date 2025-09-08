// src/api/radioBrowser.ts
import type { Station } from "../types";

type Server = { name: string; url: string; ip: string; countrycode: string; };

const RB_ROUND_ROBIN = "https://api.radio-browser.info";
const FALLBACK_MIRRORS = [
  "https://de1.api.radio-browser.info",
  "https://de2.api.radio-browser.info",
  "https://nl1.api.radio-browser.info",
  "https://at1.api.radio-browser.info",
  "https://fr1.api.radio-browser.info",
  "https://us1.api.radio-browser.info",
];

let cachedBase = "";

/** Get a healthy HTTPS mirror (cached) */
async function getBase(): Promise<string> {
  if (cachedBase) return cachedBase;

  // 1) try /json/servers from the round-robin domain
  try {
    const res = await fetch(`${RB_ROUND_ROBIN}/json/servers`, { cache: "no-store" });
    if (res.ok) {
      const servers: Server[] = await res.json();
      // Prefer https URLs
      const https = servers
        .map(s => (s.url?.startsWith("https") ? s.url.replace(/\/$/, "") : ""))
        .filter(Boolean);
      if (https.length) {
        cachedBase = https[Math.floor(Math.random() * https.length)];
        return cachedBase;
      }
    }
  } catch {}

  // 2) fallbacks
  for (const m of FALLBACK_MIRRORS) {
    try {
      const ping = await fetch(`${m}/json/stats`, { cache: "no-store" });
      if (ping.ok) { cachedBase = m; return cachedBase; }
    } catch {}
  }

  // 3) last resort
  cachedBase = FALLBACK_MIRRORS[0];
  return cachedBase;
}

function pickBestUrl(s: Station): string | null {
  const candidates = [s.url_resolved, s.url].filter(Boolean) as string[];
  const httpsFirst = candidates.sort((a, b) => Number(b.startsWith("https")) - Number(a.startsWith("https")));
  const best = httpsFirst[0] || null;

  const codec = (s.codec || "").toUpperCase();
  const supported = codec.includes("MP3") || codec.includes("AAC");
  return supported ? best : null;
}

export async function searchStations(opts: {
  query?: string;
  country?: string;   // e.g., "Romania"
  limit?: number;     // default 50
}): Promise<Station[]> {
  const { query = "", country = "", limit = 50 } = opts;

  const params = new URLSearchParams();
  params.set("hidebroken", "true");
  params.set("is_https", "true");
  if (country) params.set("country", country);
  if (query) params.set("name", query);

  const base = await getBase();

  // try up to 4 different mirrors (base + 3 fallbacks) to avoid 404s
  const attempts = [base, ...FALLBACK_MIRRORS.filter(m => m !== base)].slice(0, 4);

  let lastErr: unknown = null;
  for (const host of attempts) {
    const url = `${host}/json/stations/search?${params.toString()}`;
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) { lastErr = new Error(`${res.status} ${res.statusText} @ ${host}`); continue; }
      const all: Station[] = await res.json();

      const playable = all
        .filter(s => pickBestUrl(s))
        .sort((a, b) =>
          (Number((b as any).votes || 0) - Number((a as any).votes || 0)) ||
          (Number(b.bitrate || 0) - Number(a.bitrate || 0))
        );

      return playable.slice(0, limit);
    } catch (e) {
      lastErr = e;
    }
  }

  throw lastErr || new Error("Radio Browser: unable to reach any mirror");
}

export function resolveStreamUrl(station: Station): string | null {
  return pickBestUrl(station);
}