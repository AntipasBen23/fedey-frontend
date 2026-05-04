import { describe, it, expect } from "vitest";

// ─── impactScore — client-side mirror of backend logic ────────────────────────

function impactScore(engRate: number, impressions: number): number {
  let base = Math.floor(engRate * 12);
  if (impressions > 5000) base += 15;
  else if (impressions > 1000) base += 8;
  if (base > 100) return 100;
  if (base < 10) return 10;
  return base;
}

describe("impactScore", () => {
  it("returns minimum of 10 for zero engagement", () => {
    expect(impactScore(0, 0)).toBe(10);
  });

  it("caps at 100 for very high engagement", () => {
    expect(impactScore(100, 100000)).toBe(100);
  });

  it("adds 15 bonus for impressions over 5000", () => {
    // engRate=1 → base=12, +15 = 27
    expect(impactScore(1, 6000)).toBe(27);
  });

  it("adds 8 bonus for impressions between 1000 and 5000", () => {
    // engRate=1 → base=12, +8 = 20
    expect(impactScore(1, 2000)).toBe(20);
  });

  it("adds no bonus for impressions under 1000", () => {
    expect(impactScore(1, 500)).toBe(12);
  });

  it("never goes below 10", () => {
    expect(impactScore(0, 0)).toBeGreaterThanOrEqual(10);
  });

  it("never exceeds 100", () => {
    expect(impactScore(50, 50000)).toBeLessThanOrEqual(100);
  });
});

// ─── engagementRate calculation ───────────────────────────────────────────────

function calcEngRate(likes: number, reposts: number, comments: number, impressions: number): number {
  if (impressions === 0) return 0;
  const total = likes + reposts + comments;
  return (total / impressions) * 100;
}

describe("calcEngRate", () => {
  it("returns 0 when impressions are 0", () => {
    expect(calcEngRate(10, 5, 2, 0)).toBe(0);
  });

  it("calculates correctly with all interactions", () => {
    // (10+5+2)/100 * 100 = 17
    expect(calcEngRate(10, 5, 2, 100)).toBe(17);
  });

  it("returns 0 when all interactions are 0", () => {
    expect(calcEngRate(0, 0, 0, 500)).toBe(0);
  });

  it("handles 100% engagement rate", () => {
    expect(calcEngRate(100, 0, 0, 100)).toBe(100);
  });
});

// ─── follower growth calculation ─────────────────────────────────────────────

function calcFollowerGrowth(latest: number, oldest: number): number {
  return latest - oldest;
}

describe("calcFollowerGrowth", () => {
  it("returns positive number when followers grew", () => {
    expect(calcFollowerGrowth(1200, 1000)).toBe(200);
  });

  it("returns 0 when no change", () => {
    expect(calcFollowerGrowth(1000, 1000)).toBe(0);
  });

  it("returns negative number when followers dropped", () => {
    expect(calcFollowerGrowth(900, 1000)).toBe(-100);
  });
});
