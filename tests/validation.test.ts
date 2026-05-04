import { describe, it, expect } from "vitest";

// ─── URL validation ───────────────────────────────────────────────────────────

function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

describe("isValidUrl", () => {
  it("accepts https URL", () => {
    expect(isValidUrl("https://example.com")).toBe(true);
  });

  it("accepts http URL", () => {
    expect(isValidUrl("http://example.com")).toBe(true);
  });

  it("rejects plain text", () => {
    expect(isValidUrl("not a url")).toBe(false);
  });

  it("rejects empty string", () => {
    expect(isValidUrl("")).toBe(false);
  });

  it("accepts URL with path and query", () => {
    expect(isValidUrl("https://example.com/path?q=1")).toBe(true);
  });
});

// ─── Email validation ─────────────────────────────────────────────────────────

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

describe("isValidEmail", () => {
  it("accepts valid email", () => {
    expect(isValidEmail("user@example.com")).toBe(true);
  });

  it("rejects missing @", () => {
    expect(isValidEmail("userexample.com")).toBe(false);
  });

  it("rejects missing domain", () => {
    expect(isValidEmail("user@")).toBe(false);
  });

  it("rejects spaces", () => {
    expect(isValidEmail("user @example.com")).toBe(false);
  });

  it("accepts subdomain email", () => {
    expect(isValidEmail("user@mail.example.com")).toBe(true);
  });
});

// ─── Non-empty string guard ───────────────────────────────────────────────────

function requireNonEmpty(value: string, field: string): string | null {
  if (!value || value.trim() === "") return `${field} is required`;
  return null;
}

describe("requireNonEmpty", () => {
  it("returns null for valid string", () => {
    expect(requireNonEmpty("hello", "Name")).toBeNull();
  });

  it("returns error for empty string", () => {
    expect(requireNonEmpty("", "Name")).toBe("Name is required");
  });

  it("returns error for whitespace-only", () => {
    expect(requireNonEmpty("   ", "Name")).toBe("Name is required");
  });

  it("uses field name in error message", () => {
    expect(requireNonEmpty("", "Email")).toBe("Email is required");
  });
});

// ─── Min-length guard ─────────────────────────────────────────────────────────

function minLength(value: string, min: number): boolean {
  return value.trim().length >= min;
}

describe("minLength", () => {
  it("returns true when exactly at min", () => {
    expect(minLength("hello", 5)).toBe(true);
  });

  it("returns false when below min", () => {
    expect(minLength("hi", 5)).toBe(false);
  });

  it("trims before checking", () => {
    expect(minLength("  hi  ", 5)).toBe(false);
  });

  it("returns true for longer string", () => {
    expect(minLength("hello world", 5)).toBe(true);
  });
});
