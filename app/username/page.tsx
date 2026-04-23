"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.furciai.com";

export default function UsernamePage() {
  const router = useRouter();
  const { user, isLoggedIn, ready, updateUser } = useAuth();

  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [validationMsg, setValidationMsg] = useState("");

  // Auth guard
  useEffect(() => {
    if (ready && !isLoggedIn) {
      router.replace("/");
    }
  }, [ready, isLoggedIn, router]);

  // Validate locally as user types
  useEffect(() => {
    if (!username) {
      setValidationMsg("");
      return;
    }
    const lower = username.toLowerCase();
    if (lower.length < 3) {
      setValidationMsg("At least 3 characters required.");
    } else if (lower.length > 20) {
      setValidationMsg("Maximum 20 characters.");
    } else if (!/^[a-z0-9_]+$/.test(lower)) {
      setValidationMsg("Only letters, numbers, and underscores allowed.");
    } else {
      setValidationMsg("");
    }
  }, [username]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || validationMsg) return;
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/v1/user/username`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username: username.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to set username.");
      updateUser({ username: data.username });
      // Route based on onboarding step
      const step = user?.lastOnboardingStep;
      if (!step || step === "" || step === "/hire") {
        router.push("/hire");
      } else if (step === "completed") {
        router.push("/dashboard");
      } else {
        router.push(step);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const isValid = username.trim().length >= 3 && !validationMsg;

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "80vh",
      padding: "2rem",
    }}>
      <div style={{
        width: "100%",
        maxWidth: "480px",
        background: "linear-gradient(160deg, rgba(255,255,255,0.99), rgba(236,247,255,0.99))",
        border: "1px solid var(--border)",
        borderRadius: "24px",
        padding: "3rem 2.5rem",
        boxShadow: "0 20px 40px rgba(90,178,255,0.1)",
      }}>
        {/* Logo/icon */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>🎯</div>
          <h2 style={{ fontSize: "1.8rem", margin: "0 0 0.5rem", color: "var(--text)" }}>
            Choose your username
          </h2>
          <p style={{ color: "var(--muted)", margin: 0, fontSize: "1rem", lineHeight: 1.5 }}>
            This is how you'll appear on Furci.ai. You can change it later.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {error && (
            <div style={{
              background: "#fef2f2",
              border: "1px solid #fecaca",
              color: "#dc2626",
              borderRadius: "12px",
              padding: "0.65rem 0.9rem",
              fontSize: "0.875rem",
            }}>
              {error}
            </div>
          )}

          <div>
            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "#374151", marginBottom: "0.4rem" }}>
              Username
            </label>
            <div style={{ position: "relative" }}>
              <span style={{
                position: "absolute",
                left: "1rem",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#9ca3af",
                fontWeight: 700,
                fontSize: "1rem",
                pointerEvents: "none",
              }}>
                @
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.replace(/\s/g, ""))}
                placeholder="yourhandle"
                maxLength={20}
                autoFocus
                required
                style={{
                  width: "100%",
                  padding: "0.85rem 1rem 0.85rem 2rem",
                  borderRadius: "12px",
                  border: `1.5px solid ${validationMsg ? "#ef4444" : "#e5e7eb"}`,
                  fontSize: "1rem",
                  outline: "none",
                  boxSizing: "border-box",
                  background: "#fafafa",
                  transition: "border-color 0.15s",
                  fontWeight: 600,
                }}
                onFocus={(e) => { e.target.style.borderColor = "var(--primary-strong)"; e.target.style.background = "white"; }}
                onBlur={(e) => { e.target.style.borderColor = validationMsg ? "#ef4444" : "#e5e7eb"; e.target.style.background = "#fafafa"; }}
              />
            </div>
            {validationMsg && (
              <p style={{ fontSize: "0.78rem", color: "#ef4444", margin: "0.3rem 0 0" }}>{validationMsg}</p>
            )}
            {!validationMsg && username && (
              <p style={{ fontSize: "0.78rem", color: "#16a34a", margin: "0.3rem 0 0" }}>Looks good!</p>
            )}
            <p style={{ fontSize: "0.78rem", color: "#9ca3af", margin: "0.4rem 0 0" }}>
              3-20 characters. Letters, numbers, and underscores only.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || !isValid}
            style={{
              width: "100%",
              padding: "0.9rem",
              borderRadius: "14px",
              background: loading || !isValid
                ? "#e5e7eb"
                : "linear-gradient(180deg, #8fd1ff, var(--primary-strong))",
              color: loading || !isValid ? "#999" : "#05345a",
              fontWeight: 700,
              fontSize: "1rem",
              border: 0,
              cursor: loading || !isValid ? "not-allowed" : "pointer",
              transition: "all 0.2s",
              boxShadow: isValid && !loading ? "0 10px 20px rgba(90,178,255,0.2)" : "none",
            }}
          >
            {loading ? "Saving…" : "Set Username & Continue"}
          </button>
        </form>
      </div>
    </div>
  );
}
