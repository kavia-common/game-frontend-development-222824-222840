import React from "react";

/**
 * PUBLIC_INTERFACE
 * Cell - A simple interactive cell on the GameBoard.
 *
 * Props:
 * - value: string | number
 * - onClick: () => void
 * - active: boolean
 */
export default function Cell({ value, onClick, active }) {
  return (
    <button
      onClick={onClick}
      className="surface"
      style={{
        width: 56,
        height: 56,
        display: "grid",
        placeItems: "center",
        borderRadius: 12,
        borderColor: active ? "rgba(37,99,235,0.6)" : "var(--border-color)",
        boxShadow: active ? "0 0 0 3px rgba(37,99,235,0.18)" : "var(--shadow-soft)",
        background:
          active ? "linear-gradient(180deg, rgba(59,130,246,0.15), transparent)" : "var(--color-surface)",
        cursor: "pointer",
        fontWeight: 700,
        color: active ? "var(--color-primary)" : "var(--color-text)",
      }}
      aria-pressed={active}
    >
      {value}
    </button>
  );
}
