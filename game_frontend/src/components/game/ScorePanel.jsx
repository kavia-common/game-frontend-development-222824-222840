import React from "react";

/**
 * PUBLIC_INTERFACE
 * ScorePanel - Displays current score and best score.
 *
 * Props:
 * - score: number
 * - best: number
 */
export default function ScorePanel({ score = 0, best = 0 }) {
  return (
    <div className="surface" style={{ padding: 16 }}>
      <h3 className="title" style={{ fontSize: 20 }}>Score</h3>
      <div className="row" style={{ gap: 12 }}>
        <div className="badge"><strong>Current:</strong> {score}</div>
        <div className="badge"><strong>Best:</strong> {best}</div>
      </div>
    </div>
  );
}
