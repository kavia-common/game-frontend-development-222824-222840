const getEnv = (key, fallback = undefined) => {
  const v = process.env[key];
  return v !== undefined && v !== "" ? v : fallback;
};

// PUBLIC_INTERFACE
export function getApiBase() {
  /** Get REST base URL from env. Requires REACT_APP_API_BASE or REACT_APP_BACKEND_URL. */
  return (
    getEnv("REACT_APP_API_BASE") ||
    getEnv("REACT_APP_BACKEND_URL") ||
    "http://localhost:4000"
  );
}

// PUBLIC_INTERFACE
export function getWsUrl(path = "") {
  /** Construct WS URL using REACT_APP_WS_URL and optional path. */
  const base = getEnv("REACT_APP_WS_URL", "ws://localhost:4000");
  if (!path) return base;
  return `${base.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
}

// PUBLIC_INTERFACE
export function getFrontendUrl() {
  return getEnv("REACT_APP_FRONTEND_URL", "http://localhost:3000");
}
