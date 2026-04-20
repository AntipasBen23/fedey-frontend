"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://fedey-backend-production.up.railway.app";

type View = "login" | "signup" | "verify" | "forgot" | "reset-sent";

type PasswordStrength = { score: number; label: string; color: string };

function checkStrength(pw: string): PasswordStrength {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[a-z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[!@#$%^&*()_+\-=[\]{}|;':",./<>?]/.test(pw)) score++;

  const map: Record<number, { label: string; color: string }> = {
    0: { label: "Too weak", color: "#ef4444" },
    1: { label: "Weak", color: "#ef4444" },
    2: { label: "Fair", color: "#f59e0b" },
    3: { label: "Good", color: "#3b82f6" },
    4: { label: "Strong", color: "#22c55e" },
    5: { label: "Very strong", color: "#16a34a" },
  };
  return { score, ...map[score] };
}

const requirements = [
  { test: (p: string) => p.length >= 8, label: "At least 8 characters" },
  { test: (p: string) => /[A-Z]/.test(p), label: "One uppercase letter" },
  { test: (p: string) => /[a-z]/.test(p), label: "One lowercase letter" },
  { test: (p: string) => /\d/.test(p), label: "One number" },
  {
    test: (p: string) => /[!@#$%^&*()_+\-=[\]{}|;':",./<>?]/.test(p),
    label: "One special character",
  },
];

type Props = {
  isOpen: boolean;
  onClose: () => void;
  /** Which tab to start on. Default: "login" */
  initialView?: View;
  /** Where to redirect after a successful login/signup */
  redirectTo?: string;
  /** Called immediately after a successful login/signup, before redirect */
  onSuccess?: () => void;
};

export default function AuthModal({
  isOpen,
  onClose,
  initialView = "login",
  redirectTo = "/hire",
  onSuccess,
}: Props) {
  const { login } = useAuth();
  const router = useRouter();

  const [view, setView] = useState<View>(initialView);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pendingUserId, setPendingUserId] = useState<number | null>(null);

  // Login fields
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showLoginPw, setShowLoginPw] = useState(false);

  // Signup fields
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirm, setSignupConfirm] = useState("");
  const [showSignupPw, setShowSignupPw] = useState(false);
  const strength = checkStrength(signupPassword);

  // Verify fields
  const [code, setCode] = useState("");

  // Forgot password
  const [forgotEmail, setForgotEmail] = useState("");

  const firstInputRef = useRef<HTMLInputElement>(null);
  const googleBtnRef = useRef<HTMLDivElement>(null);
  const googleInitialized = useRef(false);

  useEffect(() => {
    if (isOpen) {
      setView(initialView);
      setError("");
      setTimeout(() => firstInputRef.current?.focus(), 100);
    }
  }, [isOpen, initialView]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/v1/user/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword,
          rememberMe,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.needsVerification) {
          setPendingUserId(data.userId);
          setView("verify");
          return;
        }
        throw new Error(data.error);
      }
      login(data.user);
      onSuccess?.();
      onClose();
      router.push(redirectTo);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (signupPassword !== signupConfirm) {
      setError("Passwords do not match.");
      return;
    }
    if (strength.score < 3) {
      setError("Please choose a stronger password.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/v1/user/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: signupName,
          email: signupEmail,
          password: signupPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.needsVerification) {
          setPendingUserId(data.userId);
          setView("verify");
          return;
        }
        throw new Error(data.error);
      }
      setPendingUserId(data.userId);
      setView("verify");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/v1/user/verify-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ userId: pendingUserId, code: code.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      login(data.user);
      onSuccess?.();
      onClose();
      router.push(redirectTo);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!pendingUserId) return;
    try {
      await fetch(`${API_URL}/v1/user/resend-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: pendingUserId }),
      });
      setError("A new code has been sent to your email.");
    } catch {
      setError("Could not resend code. Please try again.");
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await fetch(`${API_URL}/v1/user/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      });
      setView("reset-sent");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleCredential = async (response: { credential: string }) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/v1/user/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ idToken: response.credential, rememberMe }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      login(data.user);
      onSuccess?.();
      onClose();
      router.push(redirectTo);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) {
      setError("Google sign-in is not configured yet.");
      return;
    }
    const g = (window as any).google;
    if (!g) {
      setError("Google sign-in failed to load. Please refresh.");
      return;
    }
    // Initialize once, then render a hidden button and click it
    // This uses the popup flow and avoids FedCM which can be blocked
    if (!googleInitialized.current && googleBtnRef.current) {
      g.accounts.id.initialize({
        client_id: clientId,
        callback: handleGoogleCredential,
        ux_mode: "popup",
      });
      g.accounts.id.renderButton(googleBtnRef.current, {
        type: "standard",
        theme: "outline",
        size: "large",
      });
      googleInitialized.current = true;
    }
    // Click the hidden rendered Google button to trigger the popup
    const hiddenBtn = googleBtnRef.current?.querySelector("div[role=button]") as HTMLElement | null;
    hiddenBtn?.click();
  };

  // ── Shared styles ─────────────────────────────────────────────────────────

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "0.75rem 1rem",
    borderRadius: "10px",
    border: "1.5px solid #e5e7eb",
    fontSize: "0.95rem",
    outline: "none",
    boxSizing: "border-box",
    background: "#fafafa",
    transition: "border-color 0.15s",
  };

  const btnPrimary: React.CSSProperties = {
    width: "100%",
    padding: "0.85rem",
    borderRadius: "10px",
    background: loading ? "#e5e7eb" : "linear-gradient(180deg, #8fd1ff, #2498ff)",
    color: loading ? "#999" : "#05345a",
    fontWeight: 700,
    fontSize: "0.95rem",
    border: 0,
    cursor: loading ? "not-allowed" : "pointer",
    marginTop: "0.5rem",
  };

  const linkBtn: React.CSSProperties = {
    background: "none",
    border: "none",
    color: "#2498ff",
    fontWeight: 600,
    cursor: "pointer",
    fontSize: "inherit",
    padding: 0,
    textDecoration: "underline",
  };

  // ── Views ─────────────────────────────────────────────────────────────────

  const renderLogin = () => (
    <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div>
        <label style={labelStyle}>Email address</label>
        <input
          ref={firstInputRef}
          type="email"
          value={loginEmail}
          onChange={(e) => setLoginEmail(e.target.value)}
          placeholder="you@example.com"
          required
          style={inputStyle}
        />
      </div>
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
          <label style={{ ...labelStyle, marginBottom: 0 }}>Password</label>
          <button type="button" style={linkBtn} onClick={() => { setView("forgot"); setError(""); }}>
            Forgot password?
          </button>
        </div>
        <div style={{ position: "relative" }}>
          <input
            type={showLoginPw ? "text" : "password"}
            value={loginPassword}
            onChange={(e) => setLoginPassword(e.target.value)}
            placeholder="Enter your password"
            required
            style={{ ...inputStyle, paddingRight: "3rem" }}
          />
          <button
            type="button"
            onClick={() => setShowLoginPw((p) => !p)}
            style={{ position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9ca3af", fontSize: "0.85rem" }}
          >
            {showLoginPw ? "Hide" : "Show"}
          </button>
        </div>
      </div>
      <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", color: "#6b7280", cursor: "pointer" }}>
        <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
        Remember me for 30 days
      </label>
      <button type="submit" disabled={loading} style={btnPrimary}>
        {loading ? "Signing in…" : "Sign In"}
      </button>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", margin: "0.25rem 0" }}>
        <div style={{ flex: 1, height: "1px", background: "#374151" }} />
        <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>or</span>
        <div style={{ flex: 1, height: "1px", background: "#374151" }} />
      </div>
      <button type="button" onClick={handleGoogleSignIn} style={{
        display: "flex", alignItems: "center", justifyContent: "center", gap: "0.65rem",
        width: "100%", padding: "0.65rem 1rem", borderRadius: "8px",
        background: "#fff", border: "1.5px solid #d1d5db", cursor: "pointer",
        fontSize: "0.9rem", fontWeight: 600, color: "#111827",
      }}>
        <svg width="18" height="18" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          <path fill="none" d="M0 0h48v48H0z"/>
        </svg>
        Continue with Google
      </button>
      <p style={{ textAlign: "center", fontSize: "0.875rem", color: "#6b7280", margin: 0 }}>
        New to Furci.ai?{" "}
        <button type="button" style={linkBtn} onClick={() => { setView("signup"); setError(""); }}>
          Create a free account
        </button>
      </p>
    </form>
  );

  const renderSignup = () => (
    <form onSubmit={handleSignup} style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
      <div>
        <label style={labelStyle}>Full name</label>
        <input
          ref={firstInputRef}
          type="text"
          value={signupName}
          onChange={(e) => setSignupName(e.target.value)}
          placeholder="John Doe"
          required
          style={inputStyle}
        />
      </div>
      <div>
        <label style={labelStyle}>Email address</label>
        <input
          type="email"
          value={signupEmail}
          onChange={(e) => setSignupEmail(e.target.value)}
          placeholder="you@example.com"
          required
          style={inputStyle}
        />
      </div>
      <div>
        <label style={labelStyle}>Password</label>
        <div style={{ position: "relative" }}>
          <input
            type={showSignupPw ? "text" : "password"}
            value={signupPassword}
            onChange={(e) => setSignupPassword(e.target.value)}
            placeholder="Create a password"
            required
            style={{ ...inputStyle, paddingRight: "3rem" }}
          />
          <button
            type="button"
            onClick={() => setShowSignupPw((p) => !p)}
            style={{ position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9ca3af", fontSize: "0.85rem" }}
          >
            {showSignupPw ? "Hide" : "Show"}
          </button>
        </div>
        {/* Strength bar */}
        {signupPassword && (
          <div style={{ marginTop: "0.5rem" }}>
            <div style={{ display: "flex", gap: "3px", marginBottom: "0.25rem" }}>
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} style={{ flex: 1, height: "4px", borderRadius: "2px", background: i <= strength.score ? strength.color : "#e5e7eb", transition: "background 0.2s" }} />
              ))}
            </div>
            <span style={{ fontSize: "0.75rem", color: strength.color, fontWeight: 600 }}>{strength.label}</span>
          </div>
        )}
        {/* Requirements checklist */}
        {signupPassword && (
          <ul style={{ margin: "0.5rem 0 0", padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "0.2rem" }}>
            {requirements.map((r) => {
              const met = r.test(signupPassword);
              return (
                <li key={r.label} style={{ fontSize: "0.78rem", color: met ? "#16a34a" : "#9ca3af", display: "flex", alignItems: "center", gap: "0.35rem" }}>
                  <span>{met ? "✓" : "○"}</span> {r.label}
                </li>
              );
            })}
          </ul>
        )}
      </div>
      <div>
        <label style={labelStyle}>Confirm password</label>
        <input
          type="password"
          value={signupConfirm}
          onChange={(e) => setSignupConfirm(e.target.value)}
          placeholder="Re-enter your password"
          required
          style={{ ...inputStyle, borderColor: signupConfirm && signupConfirm !== signupPassword ? "#ef4444" : undefined }}
        />
        {signupConfirm && signupConfirm !== signupPassword && (
          <p style={{ fontSize: "0.78rem", color: "#ef4444", margin: "0.3rem 0 0" }}>Passwords do not match.</p>
        )}
      </div>
      <button type="submit" disabled={loading} style={btnPrimary}>
        {loading ? "Creating account…" : "Create Account"}
      </button>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", margin: "0.25rem 0" }}>
        <div style={{ flex: 1, height: "1px", background: "#374151" }} />
        <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>or</span>
        <div style={{ flex: 1, height: "1px", background: "#374151" }} />
      </div>
      <button type="button" onClick={handleGoogleSignIn} style={{
        display: "flex", alignItems: "center", justifyContent: "center", gap: "0.65rem",
        width: "100%", padding: "0.65rem 1rem", borderRadius: "8px",
        background: "#fff", border: "1.5px solid #d1d5db", cursor: "pointer",
        fontSize: "0.9rem", fontWeight: 600, color: "#111827",
      }}>
        <svg width="18" height="18" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          <path fill="none" d="M0 0h48v48H0z"/>
        </svg>
        Sign up with Google
      </button>
      <p style={{ textAlign: "center", fontSize: "0.875rem", color: "#6b7280", margin: 0 }}>
        Already have an account?{" "}
        <button type="button" style={linkBtn} onClick={() => { setView("login"); setError(""); }}>
          Sign in instead
        </button>
      </p>
    </form>
  );

  const renderVerify = () => (
    <form onSubmit={handleVerify} style={{ display: "flex", flexDirection: "column", gap: "1rem", textAlign: "center" }}>
      <div style={{ fontSize: "3.5rem" }}>📬</div>
      <p style={{ color: "#374151", margin: 0, lineHeight: 1.6 }}>
        We've sent a <strong>6-digit code</strong> to your email. Enter it below to activate your account.
      </p>
      <input
        ref={firstInputRef}
        type="text"
        inputMode="numeric"
        maxLength={6}
        value={code}
        onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
        placeholder="Enter 6-digit code"
        required
        style={{ ...inputStyle, textAlign: "center", fontSize: "1.5rem", fontWeight: 700, letterSpacing: "0.3em" }}
      />
      <button type="submit" disabled={loading || code.length !== 6} style={btnPrimary}>
        {loading ? "Verifying…" : "Verify Email"}
      </button>
      <p style={{ fontSize: "0.85rem", color: "#9ca3af", margin: 0 }}>
        Didn't receive it?{" "}
        <button type="button" style={linkBtn} onClick={handleResendCode}>
          Resend code
        </button>
      </p>
    </form>
  );

  const renderForgot = () => (
    <form onSubmit={handleForgot} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <p style={{ color: "#374151", margin: 0, lineHeight: 1.6 }}>
        Enter the email address associated with your account and we'll send you a link to reset your password.
      </p>
      <div>
        <label style={labelStyle}>Email address</label>
        <input
          ref={firstInputRef}
          type="email"
          value={forgotEmail}
          onChange={(e) => setForgotEmail(e.target.value)}
          placeholder="you@example.com"
          required
          style={inputStyle}
        />
      </div>
      <button type="submit" disabled={loading} style={btnPrimary}>
        {loading ? "Sending…" : "Send Reset Link"}
      </button>
      <p style={{ textAlign: "center", fontSize: "0.875rem", color: "#6b7280", margin: 0 }}>
        <button type="button" style={linkBtn} onClick={() => { setView("login"); setError(""); }}>
          Back to sign in
        </button>
      </p>
    </form>
  );

  const renderResetSent = () => (
    <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div style={{ fontSize: "3.5rem" }}>✉️</div>
      <h3 style={{ margin: 0, fontWeight: 800 }}>Check your inbox</h3>
      <p style={{ color: "#6b7280", margin: 0, lineHeight: 1.6 }}>
        If <strong>{forgotEmail}</strong> is registered with Furci.ai, you'll receive a password reset link within a few minutes.
      </p>
      <button
        style={{ ...btnPrimary, marginTop: "0.5rem" }}
        onClick={() => { setView("login"); setError(""); }}
      >
        Back to Sign In
      </button>
    </div>
  );

  const titles: Record<View, string> = {
    login: "Welcome back",
    signup: "Create your account",
    verify: "Verify your email",
    forgot: "Reset your password",
    "reset-sent": "Reset link sent",
  };

  return (
    <>
      {/* Google Identity Services script */}
      <script src="https://accounts.google.com/gsi/client" async defer />
      {/* Hidden container for Google's rendered button — used to trigger popup flow */}
      <div ref={googleBtnRef} style={{ position: "absolute", opacity: 0, pointerEvents: "none", width: 0, height: 0, overflow: "hidden" }} />

      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.45)",
          backdropFilter: "blur(4px)",
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1rem",
        }}
      >
        {/* Modal card */}
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            background: "#fff",
            borderRadius: "20px",
            padding: "2.25rem",
            width: "100%",
            maxWidth: "440px",
            boxShadow: "0 24px 80px rgba(0,0,0,0.18)",
            position: "relative",
          }}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            style={{
              position: "absolute",
              top: "1.25rem",
              right: "1.25rem",
              background: "none",
              border: "none",
              fontSize: "1.25rem",
              cursor: "pointer",
              color: "#9ca3af",
              lineHeight: 1,
            }}
          >
            ✕
          </button>

          {/* Logo mark */}
          <div style={{ marginBottom: "1.5rem" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/furciai-logo.png" alt="Furci.ai" style={{ height: "32px", objectFit: "contain", marginBottom: "0.75rem", display: "block" }} />
            <h2 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 800, color: "#111" }}>
              {titles[view]}
            </h2>
          </div>

          {/* Error / info message */}
          {error && (
            <div style={{
              background: error.includes("sent") || error.includes("new code") ? "#f0fdf4" : "#fef2f2",
              border: `1px solid ${error.includes("sent") || error.includes("new code") ? "#bbf7d0" : "#fecaca"}`,
              color: error.includes("sent") || error.includes("new code") ? "#166534" : "#dc2626",
              borderRadius: "10px",
              padding: "0.65rem 0.9rem",
              fontSize: "0.875rem",
              marginBottom: "1rem",
            }}>
              {error}
            </div>
          )}

          {view === "login" && renderLogin()}
          {view === "signup" && renderSignup()}
          {view === "verify" && renderVerify()}
          {view === "forgot" && renderForgot()}
          {view === "reset-sent" && renderResetSent()}
        </div>
      </div>
    </>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "0.875rem",
  fontWeight: 600,
  color: "#374151",
  marginBottom: "0.4rem",
};
