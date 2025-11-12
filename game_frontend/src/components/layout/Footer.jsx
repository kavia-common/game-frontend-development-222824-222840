import React from "react";

/**
 * PUBLIC_INTERFACE
 * Footer - App footer with subtle branding.
 */
export default function Footer() {
  return (
    <footer
      className="surface"
      style={{
        padding: "12px 16px",
        marginTop: "auto",
      }}
    >
      <div className="container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ color: "var(--color-text-secondary)" }}>
          © {new Date().getFullYear()} Ocean Professional UI
        </span>
        <span className="badge">Built with React</span>
      </div>
    </footer>
  );
}
