"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://api.furciai.com";

export default function PageTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastTrackedRef = useRef("");

  useEffect(() => {
    const query = searchParams.toString();
    const path = query ? `${pathname}?${query}` : pathname;

    if (!path || lastTrackedRef.current === path) return;
    lastTrackedRef.current = path;

    void fetch(`${API_URL}/v1/track`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path,
        referrer: document.referrer,
        user_agent: navigator.userAgent,
      }),
      keepalive: true,
      credentials: "include",
    }).catch(() => {});
  }, [pathname, searchParams]);

  return null;
}
