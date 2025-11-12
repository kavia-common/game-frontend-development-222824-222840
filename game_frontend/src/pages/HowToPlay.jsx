import React from "react";
import PageContainer from "../components/layout/PageContainer";

/**
 * PUBLIC_INTERFACE
 * How To Play Page
 */
export default function HowToPlay() {
  return (
    <PageContainer>
      <div className="surface" style={{ padding: 24 }}>
        <h1 className="title">How To Play</h1>
        <ul style={{ lineHeight: 1.7 }}>
          <li>Start the game to activate the board.</li>
          <li>Click on cells to toggle them and increase your score.</li>
          <li>Use Pause to stop the timer; Reset to clear the board.</li>
          <li>Try to beat your best score before the timer reaches 00:00.</li>
        </ul>
        <p className="subtitle">This is a placeholder flow; connect with backend events via WebSocket for real gameplay.</p>
      </div>
    </PageContainer>
  );
}
