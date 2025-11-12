import React from "react";
import PageContainer from "../components/layout/PageContainer";
// Switch to the new canvas-based game implementation
import { GameCanvas } from "../components/game";

/**
 * PUBLIC_INTERFACE
 * Game Page
 *
 * Note:
 * - Previous grid-based components (GameBoard, Cell, HUD, Controls, ScorePanel, Timer)
 *   are kept in the repository but are no longer rendered on this page.
 *   TODO: These are deprecated in favor of GameCanvas and can be removed once no longer needed.
 */
export default function Game() {
  return (
    <PageContainer>
      <section className="page-game-flex-section">
        <div className="surface" style={{ padding: 16, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h1 className="title" style={{ fontSize: 22, margin: 0 }}>Game</h1>
          <p className="subtitle" style={{ margin: 0 }}>Use arrow keys to move. Collect stars, avoid storms.</p>
        </div>
        <GameCanvas />
      </section>
    </PageContainer>
  );
}
