import React from "react";
import { Link } from "react-router-dom";
import Icon from "../common/Icon";
import Button from "../common/Button";
import useTheme from "../../hooks/useTheme";

/**
 * PUBLIC_INTERFACE
 * Header - Top navigation bar with brand and quick actions.
 */
export default function Header() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header
      className="surface"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 16px",
        position: "sticky",
        top: 0,
        zIndex: 10,
        background: "var(--color-surface)",
      }}
    >
      <div className="container" style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div className="badge">
          <Icon name="grid" />
          <strong>Ocean Pro</strong>
        </div>
        <nav style={{ display: "flex", gap: 10 }}>
          <Link to="/" className="btn" style={{ textDecoration: "none" }}>
            <Icon name="home" /> <span style={{ marginLeft: 6 }}>Home</span>
          </Link>
          <Link to="/game" className="btn" style={{ textDecoration: "none" }}>
            <Icon name="play" /> <span style={{ marginLeft: 6 }}>Game</span>
          </Link>
          <Link to="/how-to-play" className="btn" style={{ textDecoration: "none" }}>
            <Icon name="help" /> <span style={{ marginLeft: 6 }}>How To Play</span>
          </Link>
          <Link to="/settings" className="btn" style={{ textDecoration: "none" }}>
            <Icon name="settings" /> <span style={{ marginLeft: 6 }}>Settings</span>
          </Link>
        </nav>
      </div>
      <div className="container" style={{ display: "flex", justifyContent: "flex-end" }}>
        <Button variant="primary" onClick={toggleTheme} ariaLabel="Toggle Theme">
          <Icon name="theme" /> <span style={{ marginLeft: 6 }}>{theme === "light" ? "Dark" : "Light"}</span>
        </Button>
      </div>
    </header>
  );
}
