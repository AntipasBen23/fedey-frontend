"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Manrope } from "next/font/google";
import { useAuth } from "@/context/AuthContext";
import AuthModal from "@/components/AuthModal";

const manrope = Manrope({ subsets: ["latin"], weight: ["700", "800"] });

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
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <button className="btn-pulse" style={btnStyle} onClick={() => setShowAuth(true)}>
          Hire me
        </button>
        <p className={manrope.className} style={{
          fontSize: "0.88rem", color: "#94a3b8", margin: "1rem 0 0",
          letterSpacing: "0.01em", fontWeight: 400,
        }}>
          3-day free trial &nbsp;•&nbsp; Cancel anytime
        </p>
      </div>

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
        <h1 className={manrope.className} style={{
          fontSize: "clamp(2rem, 5.5vw, 4rem)", lineHeight: "1.2",
          color: "var(--text)", marginBottom: "0.5rem", fontWeight: 700,
        }}>
          Hi, I&apos;m Furci AI, your manager for
        </h1>

        {/* Rotating word */}
        <div className={manrope.className} style={{
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

        <p className={manrope.className} style={{
          fontSize: "20px", color: "#94a3b8", fontWeight: 400,
          margin: "0 auto 2.5rem", maxWidth: "56ch", lineHeight: "1.6",
        }}>
          I post, engage, and grow your audience. Every single day.
        </p>

        {cta}
      </div>
    </div>
  );
}
