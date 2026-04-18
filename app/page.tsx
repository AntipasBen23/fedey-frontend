"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import AuthModal from "@/components/AuthModal";

const ONBOARDING_PAGES = ["/hire", "/analysis", "/connect", "/strategy", "/calendar/generate"];
const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://fedey-backend-production.up.railway.app";

export default function HomePage() {
  const { isLoggedIn, user, ready, accessToken } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);
  // null = still checking, true = done, false = not done
  const [onboardingDone, setOnboardingDone] = useState<boolean | null>(null);
  const [resumeUrl, setResumeUrl] = useState("/hire");
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (searchParams.get("sessionExpired") === "1") {
      setSessionExpired(true);
      router.replace("/");
    }
  }, [searchParams, router]);

  // When logged in, check backend to know if onboarding is done
  useEffect(() => {
    if (!ready || !isLoggedIn || !accessToken) {
      if (ready && !isLoggedIn) setOnboardingDone(null); // reset for logged-out
      return;
    }

    // Check for a locally-saved specific onboarding page
    const saved = localStorage.getItem("furci_return_url");
    const validSaved = saved && ONBOARDING_PAGES.some((p) => saved.startsWith(p)) ? saved : null;
    if (validSaved) setResumeUrl(validSaved);

    // Ask the backend: has this user scheduled a calendar (= completed onboarding)?
    fetch(`${API_URL}/v1/calendar/status`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then((r) => r.ok ? r.json() : { status: "none" })
      .then((data) => setOnboardingDone(data?.status === "scheduled"))
      .catch(() => setOnboardingDone(false));
  }, [ready, isLoggedIn, accessToken]);

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

  // ── LOGGED IN ─────────────────────────────────────────────────────────────
  if (isLoggedIn) {
    // Still waiting for backend response — show nothing yet to avoid flash
    if (onboardingDone === null) {
      return renderPage(
        <div style={{ height: "3.5rem" }} /> // placeholder while loading
      );
    }

    if (!onboardingDone) {
      // Not done — send them to where they stopped (or /hire if fresh)
      return renderPage(
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem" }}>
          <button className="btn-pulse" style={btnStyle} onClick={() => router.push(resumeUrl)}>
            Continue Onboarding
          </button>
          <p style={{ fontSize: "0.9rem", color: "var(--muted)", margin: 0 }}>
            Welcome back, <strong>{user?.name?.split(" ")[0]}</strong> — let's pick up where you left off 👋
          </p>
        </div>
      );
    }

    // Onboarding complete
    return renderPage(
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem" }}>
        <Link href="/dashboard" className="btn-pulse" style={btnStyle}>
          Open Dashboard
        </Link>
        <p style={{ fontSize: "0.9rem", color: "var(--muted)", margin: 0 }}>
          Welcome back, <strong>{user?.name?.split(" ")[0]}</strong> 👋
        </p>
      </div>
    );
  }

  // ── LOGGED OUT ────────────────────────────────────────────────────────────
  return renderPage(
    <>
      <button className="btn-pulse" style={btnStyle} onClick={() => setShowAuth(true)}>
        Hire me
      </button>

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
        onSuccess={() => localStorage.removeItem("furci_return_url")}
      />
    </>
  );
}

function renderPage(cta: React.ReactNode) {
  return (
    <div className="landing-page" style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", minHeight: "80vh", textAlign: "center",
    }}>
      <div className="hero animate-fade-in-up" style={{
        padding: "4rem 2rem", maxWidth: "800px", width: "100%", marginBottom: "2rem",
      }}>
        <h1 style={{
          fontSize: "clamp(2.5rem, 8vw, 5rem)", lineHeight: "1.1",
          color: "var(--text)", marginBottom: "1.5rem",
        }}>
          Hi, I am Furci <span className="animate-float">🤖</span>
          <br />
          <span style={{
            fontSize: "clamp(1.5rem, 4vw, 2.5rem)", color: "var(--primary-strong)",
            display: "block", marginTop: "0.5rem",
          }}>
            your professional social media manager.
          </span>
        </h1>
        <p style={{
          fontSize: "1.2rem", color: "var(--muted)",
          margin: "0 auto 2.5rem", maxWidth: "60ch",
        }}>
          I handle your content, community, and strategy seamlessly — entirely
          on autopilot. Ready to scale your online presence to new heights?
        </p>
        {cta}
      </div>
    </div>
  );
}
