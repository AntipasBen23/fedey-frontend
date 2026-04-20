"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import AuthModal from "@/components/AuthModal";

const ROTATING_WORDS = [
  "content creation.",
  "community growth.",
  "brand strategy.",
  "post scheduling.",
  "audience building.",
  "social engagement.",
  "LinkedIn presence.",
  "X (Twitter) growth.",
];

export default function HomePage() {
  const { isLoggedIn, user, ready } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [wordIndex, setWordIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (searchParams.get("sessionExpired") === "1") {
      setSessionExpired(true);
      router.replace("/");
    }
  }, [searchParams, router]);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setWordIndex(i => (i + 1) % ROTATING_WORDS.length);
        setVisible(true);
      }, 300);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const btnStyle: React.CSSProperties = {
    display: "inline-block",
    padding: "1.2rem 3.5rem",
    fontSize: "1.3rem",
    fontWeight: "700",
    color: "#05345a",
    background: "linear-gradient(180deg, #8fd1ff, var(--primary-strong))",
    borderRadius: "999px",
    border: "none",
    cursor: "pointer",
    textDecoration: "none",
    transition: "transform 0.2s",
  };

  if (!ready) return null;

  if (isLoggedIn && user) {
    const step = user.lastOnboardingStep;
    const onboardingDone = step === "completed";
    const resumeUrl = (!step || step === "completed") ? "/hire" : step;

    if (!onboardingDone) {
      return renderPage(
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem" }}>
          <button className="btn-pulse" style={btnStyle} onClick={() => router.push(resumeUrl)}>
            Continue Onboarding
          </button>
          <p style={{ fontSize: "0.9rem", color: "var(--muted)", margin: 0 }}>
            Welcome back, <strong>{user.name?.split(" ")[0]}</strong> — let's pick up where you left off 👋
          </p>
        </div>,
        wordIndex, visible
      );
    }

    return renderPage(
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem" }}>
        <Link href="/dashboard" className="btn-pulse" style={btnStyle}>
          Open Dashboard
        </Link>
        <p style={{ fontSize: "0.9rem", color: "var(--muted)", margin: 0 }}>
          Welcome back, <strong>{user.name?.split(" ")[0]}</strong> 👋
        </p>
      </div>,
      wordIndex, visible
    );
  }

  return renderPage(
    <>
      <button className="btn-pulse" style={btnStyle} onClick={() => setShowAuth(true)}>
        Hire me
      </button>
      <p style={{ fontSize: "0.9rem", color: "var(--muted)", margin: "0.4rem 0 0" }}>
        7-day free trial &nbsp;·&nbsp; Cancel anytime
      </p>

      {sessionExpired && !showAuth && (
        <div style={{
          position: "fixed", top: "1.5rem", left: "50%", transform: "translateX(-50%)",
          background: "#fff3cd", border: "1px solid #ffc107", borderRadius: "10px",
          padding: "0.7rem 1.2rem", fontSize: "0.9rem", color: "#7a5800",
          fontWeight: 600, zIndex: 999, whiteSpace: "nowrap",
        }}>
          Your session expired. Please sign in again.
        </div>
      )}

      <AuthModal
        isOpen={showAuth}
        onClose={() => { setShowAuth(false); setSessionExpired(false); }}
        initialView="login"
        redirectTo="/hire"
      />
    </>,
    wordIndex, visible
  );
}

function renderPage(cta: React.ReactNode, wordIndex: number, visible: boolean) {
  return (
    <div className="landing-page" style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", minHeight: "80vh", textAlign: "center",
    }}>
      <div className="hero animate-fade-in-up" style={{
        padding: "4rem 2rem", maxWidth: "800px", width: "100%", marginBottom: "2rem",
      }}>
        <h1 style={{
          fontSize: "clamp(2.2rem, 7vw, 4.5rem)", lineHeight: "1.15",
          color: "var(--text)", marginBottom: "0.5rem",
        }}>
          <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem", flexWrap: "wrap" }}>
            Hi, I am Furci AI
            <img
              src="/furciai-logo.png"
              alt="Furci"
              className="animate-float"
              style={{ height: "1.1em", width: "auto" }}
            />
          </span>
          <span style={{ display: "block", marginTop: "0.25rem" }}>
            your assistant for
          </span>
        </h1>

        {/* Rotating word */}
        <div style={{
          fontSize: "clamp(2rem, 6vw, 4rem)",
          fontWeight: 800,
          color: "var(--primary-strong)",
          minHeight: "1.3em",
          marginBottom: "1.25rem",
          transition: "opacity 0.3s ease, transform 0.3s ease",
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(8px)",
        }}>
          {ROTATING_WORDS[wordIndex]}
        </div>

        <p style={{
          fontSize: "1.15rem", color: "var(--muted)",
          margin: "0 auto 2.5rem", maxWidth: "56ch", lineHeight: "1.6",
        }}>
          Furci AI runs your social media like a world-class manager — creating content,
          engaging your audience, and growing your presence entirely on autopilot.
        </p>

        {cta}
      </div>
    </div>
  );
}
