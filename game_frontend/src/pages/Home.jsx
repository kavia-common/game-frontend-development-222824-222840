import React from "react";
import PageContainer from "../components/layout/PageContainer";
import Button from "../components/common/Button";
import { Link } from "react-router-dom";

/**
 * PUBLIC_INTERFACE
 * Home Page
 */
export default function Home() {
  return (
    <PageContainer>
      <div className="surface" style={{ padding: 24 }}>
        <h1 className="title">Welcome to Ocean Pro Game</h1>
        <p className="subtitle">A clean, modern game interface with blue & amber accents.</p>
        <div style={{ marginTop: 16, display: "flex", gap: 12 }}>
          <Link to="/game" style={{ textDecoration: "none" }}>
            <Button variant="primary">Start Playing</Button>
          </Link>
          <Link to="/how-to-play" style={{ textDecoration: "none" }}>
            <Button>How To Play</Button>
          </Link>
        </div>
      </div>
    </PageContainer>
  );
}
