// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { createHashRouter, RouterProvider } from "react-router-dom";
import App from "./App";
import Home from "./pages/Home";
import Search from "./pages/Search";
import { PlayerProvider } from "./player/PlayerProvider";
import { CountryProvider } from "./prefs/CountryProvider";
import "./App.css";

const router = createHashRouter([
  { path: "/", element: <App />, children: [
    { index: true, element: <Home /> },
    { path: "search", element: <Search /> },
  ]},
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <PlayerProvider>
      <CountryProvider>
        <RouterProvider router={router} />
      </CountryProvider>
    </PlayerProvider>
  </React.StrictMode>
);