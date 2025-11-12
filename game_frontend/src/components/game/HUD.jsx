import React from "react";

/**
 * PUBLIC_INTERFACE
 * HUD - Heads-up display with connection, level, and status.
 *
 * Props:
 * - connected: boolean
 * - level: number
 * - status: string
 */
export default function HUD({ connected, level = 1, status = "Ready" }) {
  return (
    <div
      className="surface"
      style={{ padding: 16, display: "flex", gap: 16, alignItems: "center", justifyContent: "space-between" }}
    >
      <div className="badge">
        <span
          style={{
            display: "inline-block",
            width: 8,
            height: 8,
            borderRadius: 999,
            background: connected ? "#10B981" : "#EF4444",
            boxShadow: connected ? "0 0 0 3px rgba(16,185,129,0.25)" : "0 0 0 3px rgba(239,68,68,0.25)",
          }}
        />
        <strong>{connected ? "Connected" : "Offline"}</strong>
      </div>
      <div className="badge"><strong>Level:</strong> {level}</div>
      <div className="badge"><strong>Status:</strong> {status}</div>
    </div>
  );
}
