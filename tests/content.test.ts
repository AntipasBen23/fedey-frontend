import { describe, it, expect } from "vitest";

// ─── Content type detection ───────────────────────────────────────────────────

function getContentTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    tweet: "Tweet",
    thread: "Thread",
    carousel: "Carousel",
    video_script: "Video Script",
    linkedin_post: "LinkedIn Post",
  };
  return labels[type] || type;
}

describe("getContentTypeLabel", () => {
  it("labels a tweet", () => {
    expect(getContentTypeLabel("tweet")).toBe("Tweet");
  });

  it("labels a thread", () => {
    expect(getContentTypeLabel("thread")).toBe("Thread");
  });

  it("labels a carousel", () => {
    expect(getContentTypeLabel("carousel")).toBe("Carousel");
  });

  it("labels a video script", () => {
    expect(getContentTypeLabel("video_script")).toBe("Video Script");
  });

  it("labels a linkedin post", () => {
    expect(getContentTypeLabel("linkedin_post")).toBe("LinkedIn Post");
  });

  it("falls back to the raw type for unknown values", () => {
    expect(getContentTypeLabel("custom_type")).toBe("custom_type");
  });
});

// ─── Character limit logic ────────────────────────────────────────────────────

function getCharLimit(platforms: string[]): number {
  if (platforms.includes("twitter") || platforms.includes("x")) return 280;
  return 3000;
}

function isOverLimit(content: string, platforms: string[]): boolean {
  return content.length > getCharLimit(platforms);
}

describe("getCharLimit", () => {
  it("returns 280 for twitter", () => {
    expect(getCharLimit(["twitter"])).toBe(280);
  });

  it("returns 280 for x", () => {
    expect(getCharLimit(["x"])).toBe(280);
  });

  it("returns 280 when twitter is in a multi-platform selection", () => {
    expect(getCharLimit(["twitter", "linkedin"])).toBe(280);
  });

  it("returns 3000 for linkedin only", () => {
    expect(getCharLimit(["linkedin"])).toBe(3000);
  });

  it("returns 3000 for empty platform list", () => {
    expect(getCharLimit([])).toBe(3000);
  });
});

describe("isOverLimit", () => {
  it("returns false for short tweet", () => {
    expect(isOverLimit("Hello world", ["twitter"])).toBe(false);
  });

  it("returns true for tweet over 280 chars", () => {
    expect(isOverLimit("a".repeat(281), ["twitter"])).toBe(true);
  });

  it("returns false for linkedin post under 3000 chars", () => {
    expect(isOverLimit("a".repeat(2999), ["linkedin"])).toBe(false);
  });

  it("returns true for linkedin post over 3000 chars", () => {
    expect(isOverLimit("a".repeat(3001), ["linkedin"])).toBe(true);
  });
});

// ─── Post timing modes ────────────────────────────────────────────────────────

type TimingMode = "now" | "smart" | "specific";

function getTimingLabel(mode: TimingMode): string {
  const labels: Record<TimingMode, string> = {
    now: "Post immediately",
    smart: "Post at best time",
    specific: "Schedule for specific time",
  };
  return labels[mode];
}

describe("getTimingLabel", () => {
  it("labels now mode", () => {
    expect(getTimingLabel("now")).toBe("Post immediately");
  });

  it("labels smart mode", () => {
    expect(getTimingLabel("smart")).toBe("Post at best time");
  });

  it("labels specific mode", () => {
    expect(getTimingLabel("specific")).toBe("Schedule for specific time");
  });
});
