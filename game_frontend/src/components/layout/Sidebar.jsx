import React from "react";
import { Link, useLocation } from "react-router-dom";

/**
 * PUBLIC_INTERFACE
 * Sidebar - Left side navigation/summary panel.
 */
export default function Sidebar() {
  const location = useLocation();
  const navStyle = (path) => ({
    padding: "10px 12px",
    borderRadius: 10,
    fontWeight: 600,
    color: location.pathname === path ? "var(--color-primary)" : "var(--color-text)",
    background: location.pathname === path ? "rgba(37,99,235,0.08)" : "transparent",
    border: "1px solid var(--border-color)",
    display: "block",
    textDecoration: "none",
  });

  return (
    <aside className="surface" style={{ padding: 16, height: "fit-content" }}>
      <h3 className="title" style={{ fontSize: 18 }}>Navigation</h3>
      <div style={{ display: "grid", gap: 8 }}>
        <Link to="/" style={navStyle("/")}>Home</Link>
        <Link to="/game" style={navStyle("/game")}>Play Game</Link>
        <Link to="/how-to-play" style={navStyle("/how-to-play")}>How To Play</Link>
        <Link to="/settings" style={navStyle("/settings")}>Settings</Link>
      </div>
    </aside>
  );
}
