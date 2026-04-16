"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import AuthModal from "@/components/AuthModal";

export default function HomePage() {
  const { isLoggedIn, user } = useAuth();
  const [showAuth, setShowAuth] = useState(false);

  return (
    <div
      className="landing-page"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "80vh",
        textAlign: "center",
      }}
    >
      <div
        className="hero animate-fade-in-up"
        style={{
          padding: "4rem 2rem",
          maxWidth: "800px",
          width: "100%",
          marginBottom: "2rem",
        }}
      >
        <h1
          style={{
            fontSize: "clamp(2.5rem, 8vw, 5rem)",
            lineHeight: "1.1",
            color: "var(--text)",
            marginBottom: "1.5rem",
          }}
        >
          Hi, I am Furci <span className="animate-float">🤖</span>
          <br />
          <span
            style={{
              fontSize: "clamp(1.5rem, 4vw, 2.5rem)",
              color: "var(--primary-strong)",
              display: "block",
              marginTop: "0.5rem",
            }}
          >
            your professional social media manager.
          </span>
        </h1>
        <p
          style={{
            fontSize: "1.2rem",
            color: "var(--muted)",
            margin: "0 auto 2.5rem",
            maxWidth: "60ch",
          }}
        >
          I handle your content, community, and strategy seamlessly — entirely
          on autopilot. Ready to scale your online presence to new heights?
        </p>

        {isLoggedIn ? (
          // Returning user — go straight to dashboard
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem" }}>
            <Link
              href="/dashboard"
              className="btn-pulse"
              style={{
                display: "inline-block",
                padding: "1.2rem 3.5rem",
                fontSize: "1.3rem",
                fontWeight: "700",
                color: "#05345a",
                background: "linear-gradient(180deg, #8fd1ff, var(--primary-strong))",
                borderRadius: "999px",
                textDecoration: "none",
                transition: "transform 0.2s",
              }}
            >
              Open Dashboard
            </Link>
            <p style={{ fontSize: "0.9rem", color: "var(--muted)", margin: 0 }}>
              Welcome back, <strong>{user?.name?.split(" ")[0]}</strong> 👋
            </p>
          </div>
        ) : (
          // New / logged-out user — open auth modal
          <button
            onClick={() => setShowAuth(true)}
            className="btn-pulse"
            style={{
              display: "inline-block",
              padding: "1.2rem 3.5rem",
              fontSize: "1.3rem",
              fontWeight: "700",
              color: "#05345a",
              background: "linear-gradient(180deg, #8fd1ff, var(--primary-strong))",
              borderRadius: "999px",
              border: "none",
              cursor: "pointer",
              transition: "transform 0.2s",
            }}
          >
            Hire me
          </button>
        )}
      </div>

      <AuthModal
        isOpen={showAuth}
        onClose={() => setShowAuth(false)}
        initialView="login"
        redirectTo="/hire"
      />
    </div>
  );
}
