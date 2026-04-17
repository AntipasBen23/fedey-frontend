"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://fedey-backend-production.up.railway.app";

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

function ResetPasswordForm() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) setError("Invalid reset link. Please request a new one.");
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/v1/user/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccess(true);
      setTimeout(() => router.push("/"), 3000);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "0.75rem 1rem",
    borderRadius: "10px",
    border: "1.5px solid #e5e7eb",
    fontSize: "0.95rem",
    outline: "none",
    boxSizing: "border-box",
    background: "#fafafa",
  };

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "80vh", padding: "1rem" }}>
      <div style={{ background: "#fff", borderRadius: "20px", padding: "2.5rem", width: "100%", maxWidth: "440px", boxShadow: "0 12px 40px rgba(0,0,0,0.1)" }}>
        <div style={{ marginBottom: "1.75rem" }}>
          <div style={{ fontWeight: 900, fontSize: "1.15rem", color: "#111", marginBottom: "0.25rem" }}>
            Furci<span style={{ color: "#2498ff" }}>.ai</span>
          </div>
          <h2 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 800 }}>Set a new password</h2>
        </div>

        {success ? (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>✅</div>
            <p style={{ fontWeight: 700, color: "#16a34a" }}>Password updated successfully!</p>
            <p style={{ color: "#6b7280", fontSize: "0.9rem" }}>Redirecting you to sign in…</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {error && (
              <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", borderRadius: "10px", padding: "0.65rem 0.9rem", fontSize: "0.875rem" }}>
                {error}
              </div>
            )}
            <div>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "#374151", marginBottom: "0.4rem" }}>New password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={inputStyle} placeholder="Enter new password" />
              {password && (
                <ul style={{ margin: "0.5rem 0 0", padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                  {requirements.map((r) => {
                    const met = r.test(password);
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
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "#374151", marginBottom: "0.4rem" }}>Confirm new password</label>
              <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required style={{ ...inputStyle, borderColor: confirm && confirm !== password ? "#ef4444" : undefined }} placeholder="Re-enter new password" />
              {confirm && confirm !== password && <p style={{ fontSize: "0.78rem", color: "#ef4444", margin: "0.3rem 0 0" }}>Passwords do not match.</p>}
            </div>
            <button
              type="submit"
              disabled={loading || !token}
              style={{ width: "100%", padding: "0.85rem", borderRadius: "10px", background: loading ? "#e5e7eb" : "linear-gradient(180deg, #8fd1ff, #2498ff)", color: loading ? "#999" : "#05345a", fontWeight: 700, fontSize: "0.95rem", border: 0, cursor: loading ? "not-allowed" : "pointer", marginTop: "0.5rem" }}
            >
              {loading ? "Updating…" : "Update Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
