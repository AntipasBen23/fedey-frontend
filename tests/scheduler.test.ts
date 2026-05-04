import { describe, it, expect } from "vitest";

// ─── Schedule status helpers ───────────────────────────────────────────────────

type ScheduleStatus = "pending" | "posted" | "failed" | "cancelled";

function isActionable(status: ScheduleStatus): boolean {
  return status === "pending";
}

function isFinal(status: ScheduleStatus): boolean {
  return status === "posted" || status === "failed" || status === "cancelled";
}

function getStatusBadgeColor(status: ScheduleStatus): string {
  const colors: Record<ScheduleStatus, string> = {
    pending: "yellow",
    posted: "green",
    failed: "red",
    cancelled: "gray",
  };
  return colors[status];
}

describe("isActionable", () => {
  it("returns true for pending", () => {
    expect(isActionable("pending")).toBe(true);
  });

  it("returns false for posted", () => {
    expect(isActionable("posted")).toBe(false);
  });

  it("returns false for failed", () => {
    expect(isActionable("failed")).toBe(false);
  });

  it("returns false for cancelled", () => {
    expect(isActionable("cancelled")).toBe(false);
  });
});

describe("isFinal", () => {
  it("returns false for pending", () => {
    expect(isFinal("pending")).toBe(false);
  });

  it("returns true for posted", () => {
    expect(isFinal("posted")).toBe(true);
  });

  it("returns true for failed", () => {
    expect(isFinal("failed")).toBe(true);
  });

  it("returns true for cancelled", () => {
    expect(isFinal("cancelled")).toBe(true);
  });
});

describe("getStatusBadgeColor", () => {
  it("pending is yellow", () => {
    expect(getStatusBadgeColor("pending")).toBe("yellow");
  });

  it("posted is green", () => {
    expect(getStatusBadgeColor("posted")).toBe("green");
  });

  it("failed is red", () => {
    expect(getStatusBadgeColor("failed")).toBe("red");
  });

  it("cancelled is gray", () => {
    expect(getStatusBadgeColor("cancelled")).toBe("gray");
  });
});

// ─── Relative time labels ─────────────────────────────────────────────────────

function getRelativeTime(nowMs: number, targetMs: number): string {
  const diffMs = targetMs - nowMs;
  const diffMin = Math.round(diffMs / 60_000);
  if (diffMin < 0) return "overdue";
  if (diffMin === 0) return "now";
  if (diffMin < 60) return `in ${diffMin}m`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `in ${diffHr}h`;
  const diffDay = Math.round(diffHr / 24);
  return `in ${diffDay}d`;
}

describe("getRelativeTime", () => {
  const base = 1_000_000_000_000;

  it("returns overdue for past time", () => {
    expect(getRelativeTime(base, base - 60_000)).toBe("overdue");
  });

  it("returns now for same time", () => {
    expect(getRelativeTime(base, base)).toBe("now");
  });

  it("returns minutes label", () => {
    expect(getRelativeTime(base, base + 30 * 60_000)).toBe("in 30m");
  });

  it("returns hours label", () => {
    expect(getRelativeTime(base, base + 3 * 3_600_000)).toBe("in 3h");
  });

  it("returns days label", () => {
    expect(getRelativeTime(base, base + 2 * 86_400_000)).toBe("in 2d");
  });
});
