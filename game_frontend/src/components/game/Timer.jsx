import React, { useEffect, useRef, useState } from "react";

/**
 * PUBLIC_INTERFACE
 * Timer - Basic countdown/up timer.
 *
 * Props:
 * - mode: "up" | "down"
 * - seconds: number (for down mode)
 * - running: boolean
 * - onComplete: () => void
 */
export default function Timer({ mode = "up", seconds = 60, running = false, onComplete }) {
  const [time, setTime] = useState(mode === "down" ? seconds : 0);
  const ref = useRef(null);

  useEffect(() => {
    if (!running) {
      clearInterval(ref.current);
      return;
    }
    ref.current = setInterval(() => {
      setTime((t) => {
        if (mode === "up") return t + 1;
        if (t <= 1) {
          clearInterval(ref.current);
          onComplete?.();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(ref.current);
  }, [running, mode, onComplete]);

  useEffect(() => {
    if (mode === "down") setTime(seconds);
  }, [seconds, mode]);

  const mm = String(Math.floor(time / 60)).padStart(2, "0");
  const ss = String(time % 60).padStart(2, "0");

  return (
    <div className="surface" style={{ padding: 16 }}>
      <h3 className="title" style={{ fontSize: 20, marginBottom: 8 }}>Timer</h3>
      <div className="badge" aria-live="polite" aria-atomic="true">
        <strong>{mm}:{ss}</strong>
      </div>
    </div>
  );
}
