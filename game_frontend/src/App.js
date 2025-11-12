import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./styles/theme.css";
import Home from "./pages/Home";
import Game from "./pages/Game";
import Settings from "./pages/Settings";
import HowToPlay from "./pages/HowToPlay";

/**
 * PUBLIC_INTERFACE
 * App - Root router configuration and pages.
 */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route index element={<Home />} />
        <Route path="/game" element={<Game />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/how-to-play" element={<HowToPlay />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}
