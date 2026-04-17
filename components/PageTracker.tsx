"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://fedey-backend-production.up.railway.app";

function getSessionId(): string {
  let id = sessionStorage.getItem("furci_session_id");
  if (!id) {
    id = Math.random().toString(36).slice(2) + Date.now().toString(36);
    sessionStorage.setItem("furci_session_id", id);
  }
  return id;
}

export default function PageTracker() {
  const pathname = usePathname();
  const { user } = useAuth();

  useEffect(() => {
    // Fire and forget — never blocks the UI
    try {
      fetch(`${API_URL}/v1/track`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          path: pathname,
          referrer: document.referrer || "",
          sessionId: getSessionId(),
          userId: user?.id ?? null,
        }),
      }).catch(() => {}); // swallow all errors silently
    } catch {}
  }, [pathname, user?.id]);

  return null;
}
