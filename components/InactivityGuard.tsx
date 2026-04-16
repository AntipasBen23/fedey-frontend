"use client";

import { useInactivityLogout } from "@/hooks/useInactivityLogout";

/**
 * Invisible component — just mounts the inactivity logout hook globally.
 * Placed inside AuthProvider so it has access to auth state.
 */
export default function InactivityGuard() {
  useInactivityLogout();
  return null;
}
