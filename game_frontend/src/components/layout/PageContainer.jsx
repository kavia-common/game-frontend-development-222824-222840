import React from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import Footer from "./Footer";

/**
 * PUBLIC_INTERFACE
 * PageContainer - Standard layout wrapper with Header, Sidebar, Footer.
 *
 * Props:
 *  - children: ReactNode (main content)
 */
export default function PageContainer({ children }) {
  return (
    <div className="app-shell">
      <Header />
      <main className="container" style={{ width: "100%" }}>
        <div className="main-area">
          <Sidebar />
          <section>{children}</section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
