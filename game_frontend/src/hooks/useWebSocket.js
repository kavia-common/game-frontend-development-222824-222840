import { useEffect, useRef, useState } from "react";
import { getWsUrl } from "../utils/env";

/**
 * PUBLIC_INTERFACE
 * useWebSocket - Simple WebSocket lifecycle manager with auto-reconnect.
 *
 * Params:
 * - path: string path to append to REACT_APP_WS_URL (e.g., "/game")
 * - options: { reconnect: boolean, onMessage: (data) => void }
 *
 * Returns:
 * - { send, connected, lastMessage, error }
 */
export default function useWebSocket(path = "/game", options = {}) {
  const { reconnect = true, onMessage } = options;
  const [connected, setConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);
  const [error, setError] = useState(null);
  const wsRef = useRef(null);
  const reconnectRef = useRef(null);

  useEffect(() => {
    const url = getWsUrl(path);
    let disposed = false;

    function connect() {
      try {
        const ws = new WebSocket(url);
        wsRef.current = ws;

        ws.onopen = () => {
          if (disposed) return;
          setConnected(true);
        };
        ws.onmessage = (evt) => {
          if (disposed) return;
          try {
            const data = JSON.parse(evt.data);
            setLastMessage(data);
            if (typeof onMessage === "function") onMessage(data);
          } catch {
            setLastMessage(evt.data);
            if (typeof onMessage === "function") onMessage(evt.data);
          }
        };
        ws.onerror = (e) => {
          if (disposed) return;
          setError(e);
        };
        ws.onclose = () => {
          if (disposed) return;
          setConnected(false);
          if (reconnect) {
            clearTimeout(reconnectRef.current);
            reconnectRef.current = setTimeout(connect, 1200);
          }
        };
      } catch (e) {
        setError(e);
      }
    }

    connect();
    return () => {
      disposed = true;
      clearTimeout(reconnectRef.current);
      if (wsRef.current && wsRef.current.readyState < 2) {
        wsRef.current.close();
      }
    };
  }, [path, reconnect, onMessage]);

  const send = (payload) => {
    const ws = wsRef.current;
    if (ws && ws.readyState === 1) {
      ws.send(typeof payload === "string" ? payload : JSON.stringify(payload));
    }
  };

  return { send, connected, lastMessage, error };
}
