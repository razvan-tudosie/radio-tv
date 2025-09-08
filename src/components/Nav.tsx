import { NavLink } from "react-router-dom";
import { PlayerWidget } from "./PlayerWidget";
import { CountryWidget } from "./CountryWidget";
import { CountryModal } from "./CountryModal";

export function Nav() {
    const base = "px-4 py-2 rounded-lg";
    return (
        <>
            <div className="w-full flex items-center justify-between gap-4">
                <PlayerWidget />

                <div className="flex items-center gap-3">
                    <nav className="flex gap-3">
                        <NavLink to="/" className={({ isActive }) => `${base} ${isActive ? "bg-sky-600" : "bg-zinc-800 hover:bg-zinc-700"}`}>
                            Home
                        </NavLink>
                        <NavLink to="/search" className={({ isActive }) => `${base} ${isActive ? "bg-sky-600" : "bg-zinc-800 hover:bg-zinc-700"}`}>Search</NavLink>
                    </nav>
                    
                </div>
                <CountryWidget />
            </div>

            {/* Full-page modal lives alongside the navbar so it's available on every page */}
            <CountryModal />
        </>
    );
}