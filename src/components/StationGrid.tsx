import type { Station } from "../types";
import { StationCard } from "./StationCard";

export function StationGrid({
  stations,
  onPlay,
}: {
  stations: Station[];
  onPlay: (s: Station) => void;
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      {stations.map((s) => (
        <StationCard key={s.stationuuid} s={s} onPlay={onPlay} />
      ))}
    </div>
  );
}