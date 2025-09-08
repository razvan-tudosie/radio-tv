// src/components/HomeStationGrid.tsx
import type { Station } from "../types";
import { StationCard } from "./StationCard";

// export function HomeStationGrid({ stations, onPlay }: { stations: Station[]; onPlay: (s: Station) => void }) {
//     return (
//         <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
//             {stations.map(s => <StationCard key={s.stationuuid} s={s} onPlay={onPlay} />)}
//         </div>
//     );
// }

export function HomeStationGrid({
    stations,
    onPlay,
}: {
    stations: Station[];
    onPlay: (s: Station) => void;
}) {
    const selected = 5;
    // First 5 for the top row
    const top = stations.slice(0, selected);
    // Next 4 for the bottom row
    const bottom = stations.slice(selected, 9);

    return (
        <div className="space-y-6">
            {/* Top row: 5 large */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {top.map((s) => (
                    <StationCard
                        key={s.stationuuid}
                        s={s}
                        onPlay={onPlay}
                    />
                ))}
            </div>

            {/* Bottom row: 4 smaller */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {bottom.map((s) => (
                    <StationCard
                        key={s.stationuuid}
                        s={s}
                        onPlay={onPlay}
                    />
                ))}
            </div>
        </div>
    );
}