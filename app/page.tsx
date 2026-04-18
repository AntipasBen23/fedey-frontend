"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import AuthModal from "@/components/AuthModal";

// Pages that count as "mid-onboarding" (public, no login required to view)
const ONBOARDING_PAGES = ["/hire", "/analysis", "/connect", "/strategy", "/calendar/generate"];

export default function HomePage() {
  const { isLoggedIn, user, ready } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [returnUrl, setReturnUrl] = useState("/hire");
  const [validReturnUrl, setValidReturnUrl] = useState<string | null>(null);
  const [hasDashboard, setHasDashboard] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  // Read localStorage on the client only
  useEffect(() => {
    const saved = localStorage.getItem("furci_return_url");
    const valid = saved && ONBOARDING_PAGES.some((p) => saved.startsWith(p)) ? saved : null;
    if (saved && !valid) localStorage.removeItem("furci_return_url"); // clean stale value
    setValidReturnUrl(valid);

    // Only consider onboarding complete if the user has submitted a job description
    const jobDone = !!localStorage.getItem("furciJobDescription");
    setHasDashboard(jobDone && localStorage.getItem("furci_has_dashboard") === "1");
  }, []);

  useEffect(() => {
    if (searchParams.get("sessionExpired") === "1") {
      setSessionExpired(true);
      const saved = localStorage.getItem("furci_return_url");
      const valid = saved && ONBOARDING_PAGES.some((p) => saved.startsWith(p)) ? saved : null;
      if (valid) setReturnUrl(valid);
      router.replace("/");
    }
  }, [searchParams, router]);

  if (!ready) return null;

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

  // ── Decide what button/state to show ─────────────────────────────────────

  // CASE 1: Logged in user
  if (isLoggedIn) {
    const jobDescription = typeof window !== "undefined" ? localStorage.getItem("furciJobDescription") : null;
    const destination = validReturnUrl || (!jobDescription ? "/hire" : null);

    if (destination) {
      return renderPage(
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem" }}>
          <button className="btn-pulse" style={btnStyle} onClick={() => {
            router.push(destination);
          }}>
            Continue Onboarding
          </button>
          <p style={{ fontSize: "0.9rem", color: "var(--muted)", margin: 0 }}>
            Welcome back, <strong>{user?.name?.split(" ")[0]}</strong> — let's pick up where you left off 👋
          </p>
        </div>
      );
    }

    // Onboarding complete — go to dashboard
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

  // CASE 2: Logged out, was mid-onboarding (public page — no login needed)
  if (validReturnUrl) {
    return renderPage(
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem" }}>
        <button className="btn-pulse" style={btnStyle} onClick={() => {
          router.push(validReturnUrl);
        }}>
          Pick Up Where You Left Off
        </button>
        <p style={{ fontSize: "0.9rem", color: "var(--muted)", margin: 0 }}>
          Your onboarding progress is waiting for you.
        </p>
      </div>
    );
  }

  // CASE 3: Logged out, previously had a dashboard (needs to sign in)
  if (hasDashboard) {
    return renderPage(
      <>
        <button className="btn-pulse" style={btnStyle} onClick={() => {
          setReturnUrl("/dashboard");
          setShowAuth(true);
        }}>
          Sign In to Dashboard
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
          redirectTo={returnUrl}
          onSuccess={() => localStorage.removeItem("furci_return_url")}
        />
      </>
    );
  }

  // CASE 4: Brand new visitor — show Hire me + modal
  return renderPage(
    <>
      <button className="btn-pulse" style={btnStyle} onClick={() => setShowAuth(true)}>
        Hire me
      </button>

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
        style={{ padding: "4rem 2rem", maxWidth: "800px", width: "100%", marginBottom: "2rem" }}
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

        {cta}
      </div>
    </div>
  );
}
