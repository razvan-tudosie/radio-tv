// src/components/StationGrid.tsx
import type { Station } from "../types";
import { StationCard } from "./StationCard";

export function SearchStationGrid({ stations, onPlay }: { stations: Station[]; onPlay: (s: Station)=>void }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
      {stations.map(s => <StationCard key={s.stationuuid} s={s} onPlay={onPlay} />)}
    </div>
  );
}