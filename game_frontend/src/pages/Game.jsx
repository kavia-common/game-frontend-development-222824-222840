import React, { useCallback, useMemo, useState } from "react";
import PageContainer from "../components/layout/PageContainer";
import GameBoard from "../components/game/GameBoard";
import HUD from "../components/game/HUD";
import Controls from "../components/game/Controls";
import ScorePanel from "../components/game/ScorePanel";
import Timer from "../components/game/Timer";
import useWebSocket from "../hooks/useWebSocket";

/**
 * PUBLIC_INTERFACE
 * Game Page
 */
export default function Game() {
  const [size] = useState(5);
  const [state, setState] = useState(Array.from({ length: 25 }, () => ""));
  const [selected, setSelected] = useState(null);
  const [running, setRunning] = useState(false);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [level, setLevel] = useState(1);

  const onMessage = useCallback((msg) => {
    // placeholder to handle backend messages
    // Example could update board state or score from server
    // console.log("WS message", msg);
  }, []);

  const { send, connected } = useWebSocket("/game", { onMessage });

  const handleCellClick = (idx) => {
    setSelected(idx);
    if (running) {
      const next = [...state];
      next[idx] = next[idx] === "" ? "•" : "";
      setState(next);
      const newScore = score + 1;
      setScore(newScore);
      if (newScore > best) setBest(newScore);
      send({ action: "cell_click", index: idx });
    }
  };

  const onStart = () => {
    setRunning(true);
    setScore(0);
    setLevel((l) => l); // keep level for now
    send({ action: "start" });
  };
  const onPause = () => {
    setRunning(false);
    send({ action: "pause" });
  };
  const onReset = () => {
    setRunning(false);
    setScore(0);
    setSelected(null);
    setState(Array.from({ length: size * size }, () => ""));
    send({ action: "reset" });
  };

  const board = useMemo(
    () => (
      <GameBoard
        size={size}
        state={state}
        selectedIndex={selected}
        onCellClick={handleCellClick}
      />
    ),
    [size, state, selected]
  );

  return (
    <PageContainer>
      <div className="col">
        <HUD connected={connected} level={level} status={running ? "Running" : "Idle"} />
        {board}
        <Controls onStart={onStart} onPause={onPause} onReset={onReset} />
        <div className="row">
          <ScorePanel score={score} best={best} />
          <Timer mode="down" seconds={90} running={running} onComplete={() => setRunning(false)} />
        </div>
      </div>
    </PageContainer>
  );
}
