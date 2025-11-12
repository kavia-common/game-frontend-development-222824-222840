import React from "react";
import Button from "../common/Button";
import Icon from "../common/Icon";

/**
 * PUBLIC_INTERFACE
 * Controls - Primary game control buttons.
 *
 * Props:
 * - onStart, onPause, onReset: handlers
 */
export default function Controls({ onStart, onPause, onReset }) {
  return (
    <div className="surface" style={{ padding: 16, display: "flex", gap: 12, justifyContent: "center" }}>
      <Button variant="primary" onClick={onStart}><Icon name="play" /> <span style={{ marginLeft: 6 }}>Start</span></Button>
      <Button onClick={onPause}><Icon name="pause" /> <span style={{ marginLeft: 6 }}>Pause</span></Button>
      <Button variant="secondary" onClick={onReset}><span style={{ marginRight: 6 }}>↺</span> Reset</Button>
    </div>
  );
}
