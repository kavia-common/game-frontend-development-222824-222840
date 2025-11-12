import { useCallback, useEffect, useState } from "react";

/**
 * PUBLIC_INTERFACE
 * useTheme - Manage theme on html[data-theme] attribute.
 * Returns: { theme, setTheme, toggleTheme }
 */
export default function useTheme() {
  const [theme, setTheme] = useState(
    typeof document !== "undefined"
      ? document.documentElement.getAttribute("data-theme") || "light"
      : "light"
  );

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === "light" ? "dark" : "light"));
  }, []);

  return { theme, setTheme, toggleTheme };
}
