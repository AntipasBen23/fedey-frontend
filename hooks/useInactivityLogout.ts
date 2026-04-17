"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

const ACTIVITY_EVENTS = [
  "mousemove",
  "mousedown",
  "keydown",
  "scroll",
  "touchstart",
  "click",
];

export function useInactivityLogout() {
  const { isLoggedIn, logout } = useAuth();
  const router = useRouter();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isLoggedIn) return;

    const reset = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        // Save current page so we can return them here after re-login
        const current = window.location.pathname + window.location.search;
        if (current !== "/" && current !== "/?sessionExpired=1") {
          localStorage.setItem("furci_return_url", current);
        }
        logout();
        router.push("/?sessionExpired=1");
      }, INACTIVITY_TIMEOUT_MS);
    };

    ACTIVITY_EVENTS.forEach((e) => window.addEventListener(e, reset, { passive: true }));
    reset(); // start the timer immediately

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      ACTIVITY_EVENTS.forEach((e) => window.removeEventListener(e, reset));
    };
  }, [isLoggedIn, logout, router]);
}
