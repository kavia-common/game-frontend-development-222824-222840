import React from "react";

/**
 * PUBLIC_INTERFACE
 * Icon - Minimal icon renderer using emoji or inline SVG map.
 *
 * Props:
 * - name: string ("menu","settings","play","pause","timer","grid","home")
 * - size: number (px)
 * - color: string (css color)
 */
export default function Icon({ name, size = 18, color = "currentColor" }) {
  const styles = { display: "inline-block", fontSize: size, color };

  // Simple map; can be expanded/replaced with SVG set later
  const map = {
    menu: "☰",
    settings: "⚙️",
    play: "▶️",
    pause: "⏸️",
    timer: "⏱️",
    grid: "🔲",
    home: "🏠",
    help: "❓",
    theme: "🌓",
    back: "⬅️",
  };

  return <span style={styles} aria-hidden="true">{map[name] ?? "•"}</span>;
}
