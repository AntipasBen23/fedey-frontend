import { describe, it, expect } from "vitest";

// ─── Engagement rate helpers ──────────────────────────────────────────────────

function calcEngRate(likes: number, replies: number, impressions: number): number {
  if (impressions === 0) return 0;
  return parseFloat((((likes + replies) / impressions) * 100).toFixed(2));
}

describe("calcEngRate", () => {
  it("returns 0 when impressions are 0", () => {
    expect(calcEngRate(100, 50, 0)).toBe(0);
  });

  it("calculates basic rate", () => {
    expect(calcEngRate(10, 0, 100)).toBe(10);
  });

  it("includes replies in numerator", () => {
    expect(calcEngRate(5, 5, 100)).toBe(10);
  });

  it("rounds to 2 decimal places", () => {
    expect(calcEngRate(1, 0, 3)).toBe(33.33);
  });

  it("returns 0 for all-zero input", () => {
    expect(calcEngRate(0, 0, 0)).toBe(0);
  });
});

// ─── Follower growth ──────────────────────────────────────────────────────────

function followerGrowthPct(previous: number, current: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return parseFloat((((current - previous) / previous) * 100).toFixed(1));
}

describe("followerGrowthPct", () => {
  it("returns 100 when growing from zero", () => {
    expect(followerGrowthPct(0, 500)).toBe(100);
  });

  it("returns 0 when no change from zero", () => {
    expect(followerGrowthPct(0, 0)).toBe(0);
  });

  it("calculates positive growth", () => {
    expect(followerGrowthPct(1000, 1100)).toBe(10);
  });

  it("calculates negative growth", () => {
    expect(followerGrowthPct(1000, 900)).toBe(-10);
  });

  it("rounds to one decimal place", () => {
    expect(followerGrowthPct(300, 301)).toBe(0.3);
  });
});

// ─── Best post selection ──────────────────────────────────────────────────────

interface PostMetric {
  id: string;
  likes: number;
  replies: number;
  impressions: number;
}

function getBestPost(posts: PostMetric[]): PostMetric | null {
  if (posts.length === 0) return null;
  return posts.reduce((best, post) => {
    const bestRate = best.impressions > 0 ? (best.likes + best.replies) / best.impressions : 0;
    const postRate = post.impressions > 0 ? (post.likes + post.replies) / post.impressions : 0;
    return postRate > bestRate ? post : best;
  });
}

describe("getBestPost", () => {
  it("returns null for empty array", () => {
    expect(getBestPost([])).toBeNull();
  });

  it("returns only post when one item", () => {
    const post = { id: "a", likes: 10, replies: 2, impressions: 100 };
    expect(getBestPost([post])).toBe(post);
  });

  it("returns post with highest engagement rate", () => {
    const low = { id: "low", likes: 5, replies: 0, impressions: 1000 };
    const high = { id: "high", likes: 50, replies: 10, impressions: 500 };
    expect(getBestPost([low, high])?.id).toBe("high");
  });

  it("handles zero impressions gracefully", () => {
    const zero = { id: "zero", likes: 100, replies: 100, impressions: 0 };
    const normal = { id: "normal", likes: 1, replies: 0, impressions: 10 };
    expect(getBestPost([zero, normal])?.id).toBe("normal");
  });
});
