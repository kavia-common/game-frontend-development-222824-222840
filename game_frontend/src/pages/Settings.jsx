import React from "react";
import PageContainer from "../components/layout/PageContainer";
import useTheme from "../hooks/useTheme";
import Button from "../components/common/Button";

/**
 * PUBLIC_INTERFACE
 * Settings Page
 */
export default function Settings() {
  const { theme, toggleTheme } = useTheme();

  return (
    <PageContainer>
      <div className="surface" style={{ padding: 24 }}>
        <h1 className="title">Settings</h1>
        <p className="subtitle">Customize your experience.</p>

        <div style={{ marginTop: 16, display: "grid", gap: 14, maxWidth: 520 }}>
          <div className="surface" style={{ padding: 16 }}>
            <h3 className="title" style={{ fontSize: 18, marginBottom: 8 }}>Theme</h3>
            <p className="subtitle">Current theme: <strong className="accent">{theme}</strong></p>
            <Button variant="primary" onClick={toggleTheme}>Toggle Theme</Button>
          </div>

          <div className="surface" style={{ padding: 16 }}>
            <h3 className="title" style={{ fontSize: 18, marginBottom: 8 }}>Performance</h3>
            <p className="subtitle">Game rendering uses simple CSS and React. Advanced settings coming soon.</p>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
