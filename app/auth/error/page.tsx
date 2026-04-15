"use client"

import { useSearchParams } from "next/navigation"
import { Suspense } from "react"

const errorMessages: Record<string, { title: string; description: string }> = {
  Configuration: {
    title: "Server Configuration Error",
    description: "There is a problem with the server configuration. Please try again or contact support.",
  },
  AccessDenied: {
    title: "Access Denied",
    description: "You denied access. Please try again and authorize Furci to manage your account.",
  },
  OAuthSignin: {
    title: "Sign-in Error",
    description: "Could not start the sign-in flow. Please try again.",
  },
  OAuthCallback: {
    title: "Callback Error",
    description: "There was a problem completing the sign-in. Please try again.",
  },
  Default: {
    title: "Authentication Error",
    description: "An unexpected error occurred. Please try again.",
  },
}

function AuthErrorContent() {
  const params = useSearchParams()
  const error = params.get("error") ?? "Default"
  const info = errorMessages[error] ?? errorMessages.Default

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "2rem",
      background: "var(--background, #f8fafc)",
    }}>
      <div style={{
        background: "white",
        border: "1px solid #fecaca",
        borderRadius: "16px",
        padding: "2.5rem",
        maxWidth: "480px",
        width: "100%",
        textAlign: "center",
        boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
      }}>
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⚠️</div>
        <h1 style={{ color: "#dc2626", fontSize: "1.5rem", margin: "0 0 0.75rem" }}>
          {info.title}
        </h1>
        <p style={{ color: "#6b7280", margin: "0 0 2rem", lineHeight: 1.6 }}>
          {info.description}
        </p>
        <a
          href="/connect/twitter"
          style={{
            display: "inline-block",
            padding: "0.9rem 2.5rem",
            background: "#1DA1F2",
            color: "#fff",
            borderRadius: "10px",
            textDecoration: "none",
            fontWeight: "700",
            fontSize: "1rem",
          }}
        >
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
