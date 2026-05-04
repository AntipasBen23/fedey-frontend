import { describe, it, expect } from "vitest";

// ─── Platform normalisation ───────────────────────────────────────────────────

function normalisePlatform(raw: string): string {
  const lower = raw.toLowerCase().trim();
  if (lower === "x") return "twitter";
  return lower;
}

describe("normalisePlatform", () => {
  it("normalises 'x' to 'twitter'", () => {
    expect(normalisePlatform("x")).toBe("twitter");
  });

  it("normalises 'X' (uppercase) to 'twitter'", () => {
    expect(normalisePlatform("X")).toBe("twitter");
  });

  it("lowercases twitter", () => {
    expect(normalisePlatform("Twitter")).toBe("twitter");
  });

  it("lowercases linkedin", () => {
    expect(normalisePlatform("LinkedIn")).toBe("linkedin");
  });

  it("trims whitespace", () => {
    expect(normalisePlatform("  twitter  ")).toBe("twitter");
  });
});

// ─── Platform display icons ───────────────────────────────────────────────────

const PLATFORM_ICONS: Record<string, string> = {
  twitter: "𝕏",
  x: "𝕏",
  linkedin: "in",
};

function getPlatformIcon(platform: string): string {
  return PLATFORM_ICONS[platform?.toLowerCase()] || platform || "—";
}

describe("getPlatformIcon", () => {
  it("returns 𝕏 for twitter", () => {
    expect(getPlatformIcon("twitter")).toBe("𝕏");
  });

  it("returns 𝕏 for x", () => {
    expect(getPlatformIcon("x")).toBe("𝕏");
  });

  it("returns in for linkedin", () => {
    expect(getPlatformIcon("linkedin")).toBe("in");
  });

  it("returns — for unknown platform", () => {
    expect(getPlatformIcon("")).toBe("—");
  });

  it("handles undefined gracefully", () => {
    expect(getPlatformIcon(undefined as any)).toBe("—");
  });

  it("is case insensitive", () => {
    expect(getPlatformIcon("Twitter")).toBe("𝕏");
  });
});

// ─── Post status logic ────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  posted: "#22c55e",
  pending: "#f59e0b",
  failed: "#ef4444",
};

function getStatusColor(status: string): string {
  return STATUS_COLORS[status] || "#9ca3af";
}

describe("getStatusColor", () => {
  it("returns green for posted", () => {
    expect(getStatusColor("posted")).toBe("#22c55e");
  });

  it("returns amber for pending", () => {
    expect(getStatusColor("pending")).toBe("#f59e0b");
  });

  it("returns red for failed", () => {
    expect(getStatusColor("failed")).toBe("#ef4444");
  });

  it("returns grey for unknown status", () => {
    expect(getStatusColor("unknown")).toBe("#9ca3af");
  });
});
