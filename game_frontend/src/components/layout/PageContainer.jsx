import React from "react";
import Header from "./Header";
import Footer from "./Footer";

/**
 * PUBLIC_INTERFACE
 * PageContainer - Standard layout wrapper with Header and Footer (no sidebar).
 *
 * Props:
 *  - children: ReactNode (main content)
 */
export default function PageContainer({ children }) {
  return (
    <div className="app-shell">
      <Header />
      <main className="container" style={{ width: "100%" }}>
        <div className="main-area no-sidebar">
          <section style={{ width: "100%" }}>{children}</section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
