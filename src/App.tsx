// src/App.tsx
import { Outlet } from "react-router-dom";
import { Nav } from "./components/Nav";

export default function App() {
    return (
        <div className="h-full text-white">
            <header className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
                <div className="text-2xl font-semibold">Radio TV</div>
                <Nav />
            </header>
            <main className="max-w-6xl mx-auto px-6 pb-10">
                <Outlet />
            </main>
        </div>
    );
}