import { describe, it, expect } from "vitest";

// ─── Date formatting ──────────────────────────────────────────────────────────

function formatPostDate(dateStr: string): string {
  const d = new Date(dateStr);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(d);
}

describe("formatPostDate", () => {
  it("formats a valid ISO date string", () => {
    const result = formatPostDate("2026-04-25T10:00:00Z");
    expect(result).toMatch(/Apr/);
    expect(result).toMatch(/25/);
  });

  it("includes hour and minute", () => {
    const result = formatPostDate("2026-04-25T14:30:00Z");
    expect(result).toMatch(/:/);
  });

  it("uses 12-hour format with AM/PM", () => {
    const result = formatPostDate("2026-04-25T14:00:00Z");
    expect(result).toMatch(/AM|PM/);
  });
});

// ─── Snippet truncation ───────────────────────────────────────────────────────

function makeSnippet(content: string, maxLen = 90): string {
  if (content.length <= maxLen) return content;
  return content.slice(0, maxLen) + "…";
}

describe("makeSnippet", () => {
  it("leaves short content unchanged", () => {
    const text = "Short post";
    expect(makeSnippet(text)).toBe(text);
  });

  it("truncates at 90 chars and appends ellipsis", () => {
    const text = "a".repeat(100);
    const result = makeSnippet(text);
    expect(result).toHaveLength(91); // 90 + ellipsis char
    expect(result.endsWith("…")).toBe(true);
  });

  it("does not truncate exactly 90 chars", () => {
    const text = "a".repeat(90);
    expect(makeSnippet(text)).toBe(text);
  });

  it("handles empty string", () => {
    expect(makeSnippet("")).toBe("");
  });
});

// ─── Follower count formatting ────────────────────────────────────────────────

function formatFollowerCount(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toString();
}

describe("formatFollowerCount", () => {
  it("formats millions", () => {
    expect(formatFollowerCount(1_500_000)).toBe("1.5M");
  });

  it("formats thousands", () => {
    expect(formatFollowerCount(2_300)).toBe("2.3K");
  });

  it("returns raw number under 1000", () => {
    expect(formatFollowerCount(450)).toBe("450");
  });

  it("handles zero", () => {
    expect(formatFollowerCount(0)).toBe("0");
  });

  it("handles exactly 1000", () => {
    expect(formatFollowerCount(1000)).toBe("1.0K");
  });
});
