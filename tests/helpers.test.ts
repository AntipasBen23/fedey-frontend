import { describe, it, expect } from "vitest";

// ─── friendlyError logic ──────────────────────────────────────────────────────
// Mirrors the friendlyError helper used in AuthModal

function friendlyError(e: unknown): string {
  if (e instanceof TypeError) {
    return "Unable to reach the server. Please check your internet connection and try again.";
  }
  if (e instanceof Error) return e.message;
  return "Something went wrong. Please try again.";
}

describe("friendlyError", () => {
  it("returns network message for TypeError", () => {
    const e = new TypeError("Failed to fetch");
    expect(friendlyError(e)).toBe(
      "Unable to reach the server. Please check your internet connection and try again."
    );
  });

  it("returns the error message for a generic Error", () => {
    const e = new Error("Invalid credentials");
    expect(friendlyError(e)).toBe("Invalid credentials");
  });

  it("returns fallback string for unknown type", () => {
    expect(friendlyError("some string error")).toBe(
      "Something went wrong. Please try again."
    );
  });

  it("returns fallback for null", () => {
    expect(friendlyError(null)).toBe("Something went wrong. Please try again.");
  });

  it("returns fallback for undefined", () => {
    expect(friendlyError(undefined)).toBe(
      "Something went wrong. Please try again."
    );
  });

  it("returns fallback for plain object", () => {
    expect(friendlyError({ code: 500 })).toBe(
      "Something went wrong. Please try again."
    );
  });
});

// ─── Tweet truncation logic ───────────────────────────────────────────────────
// Client-side mirror of the backend TruncateTweet behaviour

function truncateTweet(text: string, limit = 280): string {
  const runes = [...text];
  if (runes.length <= limit) return text;
  let cut = limit - 1;
  while (cut > 0 && runes[cut] !== " ") cut--;
  if (cut === 0) cut = limit - 1;
  return runes.slice(0, cut).join("") + "…";
}

describe("truncateTweet", () => {
  it("leaves short text unchanged", () => {
    expect(truncateTweet("Hello")).toBe("Hello");
  });

  it("leaves exactly 280 chars unchanged", () => {
    const text = "a".repeat(280);
    expect(truncateTweet(text)).toBe(text);
  });

  it("truncates text over 280 chars", () => {
    const text = "a".repeat(300);
    expect([...truncateTweet(text)].length).toBeLessThanOrEqual(280);
  });

  it("appends ellipsis on truncation", () => {
    const text = ("word ").repeat(70);
    expect(truncateTweet(text)).toMatch(/…$/);
  });

  it("handles empty string", () => {
    expect(truncateTweet("")).toBe("");
  });
});
