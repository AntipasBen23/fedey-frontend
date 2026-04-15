"use client"

import { useSearchParams } from "next/navigation"
import { useEffect, useState, Suspense } from "react"

function AuthErrorContent() {
  const params = useSearchParams()
  const error = params.get("error") ?? "Unknown"
  const detail = params.get("detail") ?? ""
  const [diag, setDiag] = useState<any>(null)

  useEffect(() => {
    // Log everything to Chrome DevTools console
    console.error("=== FURCI AUTH ERROR ===")
    console.error("Error code:", error)
    console.error("Detail:", detail || "(none)")
    console.error("Full URL:", window.location.href)
    console.error("All params:", Object.fromEntries(params.entries()))

    // Fetch the debug-auth diagnostic info
    fetch("/api/debug-auth")
      .then((r) => r.json())
      .then((data) => {
        setDiag(data)
        console.error("Auth config state:", data)
      })
      .catch((e) => console.error("Could not fetch debug-auth:", e))
  }, [error, detail, params])

  const errorMessages: Record<string, string> = {
    Configuration: "NextAuth configuration error — likely a credential mismatch or Twitter OAuth 2.0 setup issue.",
    AccessDenied: "You denied access on Twitter.",
    OAuthSignin: "Error starting the Twitter sign-in flow.",
    OAuthCallback: "Error handling the Twitter callback — state/PKCE mismatch or token exchange failed.",
    OAuthCreateAccount: "Could not create an account.",
    Default: "An unexpected error occurred.",
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0f0f0f",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "2rem",
      fontFamily: "monospace"
    }}>
      <div style={{
        background: "#1a1a1a",
        border: "1px solid #ff4444",
        borderRadius: "12px",
        padding: "2rem",
        maxWidth: "700px",
        width: "100%"
      }}>
        <h1 style={{ color: "#ff4444", margin: "0 0 1rem" }}>Auth Error: {error}</h1>
        <p style={{ color: "#ccc", marginBottom: "1.5rem" }}>
          {errorMessages[error] ?? errorMessages.Default}
        </p>

        <div style={{ background: "#111", borderRadius: "8px", padding: "1rem", marginBottom: "1rem" }}>
          <p style={{ color: "#888", margin: "0 0 0.5rem", fontSize: "0.85rem" }}>Error Details (also in Chrome DevTools Console):</p>
          <pre style={{ color: "#ff9900", margin: 0, whiteSpace: "pre-wrap", fontSize: "0.85rem" }}>
            {JSON.stringify({
              error,
              detail: detail || "(no detail)",
              url: typeof window !== "undefined" ? window.location.href : "",
              allParams: typeof window !== "undefined"
                ? Object.fromEntries(new URLSearchParams(window.location.search))
                : {}
            }, null, 2)}
          </pre>
        </div>

        {diag && (
          <div style={{ background: "#111", borderRadius: "8px", padding: "1rem", marginBottom: "1rem" }}>
            <p style={{ color: "#888", margin: "0 0 0.5rem", fontSize: "0.85rem" }}>Server Config State:</p>
            <pre style={{ color: "#66ff66", margin: 0, whiteSpace: "pre-wrap", fontSize: "0.85rem" }}>
              {JSON.stringify(diag, null, 2)}
            </pre>
          </div>
        )}

        <div style={{ background: "#111", borderRadius: "8px", padding: "1rem", marginBottom: "1.5rem" }}>
          <p style={{ color: "#888", margin: "0 0 0.5rem", fontSize: "0.85rem" }}>Checklist:</p>
          <ul style={{ color: "#ccc", margin: 0, paddingLeft: "1.5rem", lineHeight: "2" }}>
            <li>Twitter app has <strong style={{color:"#fff"}}>OAuth 2.0 enabled</strong> (not just OAuth 1.0a)</li>
            <li>Twitter app type is <strong style={{color:"#fff"}}>Web App</strong> (not Native)</li>
            <li>Callback URL is exactly: <code style={{color:"#66ccff"}}>https://furciai.com/api/auth/callback/twitter</code></li>
            <li><code style={{color:"#66ccff"}}>AUTH_TWITTER_ID</code> = OAuth 2.0 Client ID (not API Key)</li>
            <li><code style={{color:"#66ccff"}}>AUTH_TWITTER_SECRET</code> = OAuth 2.0 Client Secret (not API Key Secret)</li>
          </ul>
        </div>

        <a href="/connect/twitter" style={{
          display: "inline-block",
          padding: "0.8rem 2rem",
          background: "#1DA1F2",
          color: "#fff",
          borderRadius: "8px",
          textDecoration: "none",
          fontWeight: "bold"
        }}>
          Try Again
        </a>
      </div>
    </div>
  )
}

export default function AuthErrorPage() {
  return (
    <Suspense>
      <AuthErrorContent />
    </Suspense>
  )
}
