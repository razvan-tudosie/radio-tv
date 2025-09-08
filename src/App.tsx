// src/App.tsx
import { Outlet } from "react-router-dom";
import { Nav } from "./components/Nav";

export default function App() {
    return (
        <div className="h-full text-white p-15">
            <header className="mb-15 mx-auto flex items-center justify-between">
                {/* <div className="text-2xl font-semibold">Radio TV</div> */}
                <Nav />
            </header>
            <main className="mx-auto">
                <Outlet />
            </main>
        </div>
    );
}