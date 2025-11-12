import React, { useEffect, useRef } from "react";

/**
 * PUBLIC_INTERFACE
 * GameCanvas - Multi-layer canvas-based game component with 16:9 responsive wrapper.
 * The exact code for GameCanvas should be pasted here as provided by the user.
 *
 * Notes:
 * - This component expects multiple canvas layers stacked absolutely.
 * - It includes keyboard controls (arrow keys), scoring/level UI, storms, stars, clouds, and restart after game over.
 * - Styles for .game-canvas-host, .game-canvas-wrapper-169, and .layer are defined in src/styles/game-canvas.css.
 *
 * Ocean Professional theme alignment:
 * - Container uses theme colors via CSS variables where appropriate.
 * - Minimal inline styles; main appearance handled by CSS file.
 */

// IMPORTANT: The user requested to "paste the exact provided code for GameCanvas".
// As the exact code content was not included in the task payload, this file provides
// the expected component shell and wiring points. Replace the placeholder implementation
// below with the exact provided GameCanvas code when available.

import "../../styles/game-canvas.css";

/**
 * Placeholder shim to preserve interfaces until the exact provided code is pasted.
 * Replace everything inside this component with the provided implementation.
 */
export default function GameCanvas() {
  const bgRef = useRef(null);
  const midRef = useRef(null);
  const fgRef = useRef(null);
  const uiRef = useRef(null);

  useEffect(() => {
    // Minimal demo render so the route doesn't break before the provided code is inserted.
    const bg = bgRef.current?.getContext("2d");
    const mid = midRef.current?.getContext("2d");
    const fg = fgRef.current?.getContext("2d");
    const ui = uiRef.current?.getContext("2d");

    const resize = () => {
      const wrapper = bgRef.current?.parentElement;
      if (!wrapper) return;
      const rect = wrapper.getBoundingClientRect();
      const width = Math.floor(rect.width);
      const height = Math.floor(rect.height);
      [bgRef, midRef, fgRef, uiRef].forEach((r) => {
        if (r.current) {
          r.current.width = width;
          r.current.height = height;
        }
      });

      if (bg) {
        bg.clearRect(0, 0, width, height);
        bg.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--color-primary-500") || "#3B82F6";
        const grad = bg.createLinearGradient(0, 0, 0, height);
        grad.addColorStop(0, "rgba(59,130,246,0.18)");
        grad.addColorStop(1, "rgba(249,250,251,0.9)");
        bg.fillStyle = grad;
        bg.fillRect(0, 0, width, height);
      }

      if (mid) {
        mid.clearRect(0, 0, width, height);
        mid.fillStyle = "rgba(255,255,255,0.8)";
        for (let i = 0; i < 12; i++) {
          const x = Math.random() * width;
          const y = Math.random() * (height * 0.4);
          const w = 60 + Math.random() * 80;
          const h = 18 + Math.random() * 12;
          mid.beginPath();
          mid.ellipse(x, y, w, h, 0, 0, Math.PI * 2);
          mid.fill();
        }
      }

      if (fg) {
        fg.clearRect(0, 0, width, height);
        fg.fillStyle = "rgba(37,99,235,0.25)";
        for (let i = 0; i < 20; i++) {
          const x = Math.random() * width;
          const y = Math.random() * height;
          fg.beginPath();
          fg.arc(x, y, 2 + Math.random() * 2, 0, Math.PI * 2);
          fg.fill();
        }
      }

      if (ui) {
        ui.clearRect(0, 0, width, height);
        ui.fillStyle = "rgba(0,0,0,0.55)";
        ui.font = "600 16px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu";
        ui.fillText("GameCanvas placeholder — replace with provided code", 18, 28);
        ui.fillStyle = "rgba(245,158,11,0.95)";
        ui.font = "700 18px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu";
        ui.fillText("Ocean Professional", 18, 52);
      }
    };

    resize();
    const r = new ResizeObserver(resize);
    if (bgRef.current?.parentElement) r.observe(bgRef.current.parentElement);
    window.addEventListener("resize", resize);
    return () => {
      r.disconnect();
      window.removeEventListener("resize", resize);
    };
  }, []);

  // Keyboard listeners and game logic are expected in the provided code; omitted here.
  return (
    <div className="game-canvas-host surface" role="region" aria-label="Game Canvas">
      <div className="game-canvas-wrapper-169">
        <canvas ref={bgRef} className="layer" aria-hidden="true" />
        <canvas ref={midRef} className="layer" aria-hidden="true" />
        <canvas ref={fgRef} className="layer" aria-hidden="true" />
        <canvas ref={uiRef} className="layer" aria-label="UI Overlay" />
      </div>
    </div>
  );
}
