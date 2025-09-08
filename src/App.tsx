// src/App.tsx
import { Outlet } from "react-router-dom";
import { Nav } from "./components/Nav";

export default function App() {
    return (
        <div className="h-full text-white"
        style={{
                    background:"radial-gradient(1200px 700px at 50% 20%, #5a1f22 0%, #240f12 40%, #0a090e 100%)",
                }}>
            <header
                className="mb-15 p-15 mx-auto flex items-center justify-between ">
                {/* <div className="text-2xl font-semibold">Radio TV</div> */}
                <Nav />
            </header>
            <main className="mx-auto">
                <Outlet />
            </main>
        </div>
    );
}


