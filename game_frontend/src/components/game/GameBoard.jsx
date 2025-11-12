import React from "react";
import Cell from "./Cell";

/**
 * PUBLIC_INTERFACE
 * GameBoard - Renders a square grid of cells.
 *
 * Props:
 * - size: number (grid size NxN)
 * - state: array of length size*size
 * - onCellClick: (index) => void
 * - selectedIndex: number | null
 */
export default function GameBoard({ size = 5, state = [], onCellClick, selectedIndex = null }) {
  const gridStyle = {
    display: "grid",
    gridTemplateColumns: `repeat(${size}, 56px)`,
    gap: 12,
    justifyContent: "center",
  };

  return (
    <div className="surface" style={{ padding: 16 }}>
      <div style={gridStyle}>
        {Array.from({ length: size * size }).map((_, i) => (
          <Cell
            key={i}
            value={state[i] ?? ""}
            active={i === selectedIndex}
            onClick={() => onCellClick?.(i)}
          />
        ))}
      </div>
    </div>
  );
}
