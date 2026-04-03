import { describe, expect, it } from "vitest";

import {
  getActiveStep,
  getLiveStatus,
  getStepState,
  isSessionLive,
  summarizeWeeklyGrowth
} from "../lib/utils/hiring";
import type { OnboardingSession } from "../lib/contracts/onboarding";
import type { PublishingSchedule } from "../lib/contracts/publishing";

function buildSession(overrides: Partial<OnboardingSession> = {}): OnboardingSession {
  return {
    id: "onb-1",
    title: "Fedey Social Agent",
    jobDescription: "Run our social media",
    accountMode: "existing",
    objective: "authority",
    primaryPlatform: "x",
    brandName: "Fedey",
    audience: "Founders",
    voiceSummary: "clear and strategic",
    constraints: [],
    reviewMode: "manual",
    approvalStatus: "not_started",
    chatMessages: [],
    questions: [],
    audit: {
      status: "not_started",
      connectedPlatforms: [],
      postsReviewed: 0,
      replyPatterns: [],
      contentPatterns: [],
      recommendations: [],
      performanceInsights: []
    },
    activation: {
      status: "not_started",
      brandMemorySync: false,
      drafts: [],
      weekPlan: [],
      summary: ""
    },
    history: [],
    status: "interview",
    createdAt: "2026-04-03T00:00:00.000Z",
    updatedAt: "2026-04-03T00:00:00.000Z",
    ...overrides
  };
}

function buildSchedule(overrides: Partial<PublishingSchedule> = {}): PublishingSchedule {
  return {
    id: "sch-1",
    draftId: "draft-1",
    channel: "x",
    queueProfile: "existing",
    scheduledFor: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    status: "scheduled",
    createdAt: "2026-04-03T00:00:00.000Z",
    ...overrides
  };
}

describe("hiring helpers", () => {
  it("calculates the active onboarding step from session and connection state", () => {
    expect(getActiveStep(undefined, false, false)).toBe(1);

    const waitingForConnections = buildSession();
    expect(getActiveStep(waitingForConnections, false, false)).toBe(2);

    const waitingForAnswers = buildSession({
      questions: [
        {
          id: "q-1",
          sessionId: "onb-1",
          prompt: "Who is the audience?",
          category: "audience",
          required: true,
          createdAt: "2026-04-03T00:00:00.000Z"
        }
      ]
    });
    expect(getActiveStep(waitingForAnswers, true, false)).toBe(3);

    const readyToLaunch = buildSession({
      questions: [
        {
          id: "q-1",
          sessionId: "onb-1",
          prompt: "Who is the audience?",
          category: "audience",
          answer: "Founders",
          required: true,
          createdAt: "2026-04-03T00:00:00.000Z"
        }
      ]
    });
    expect(getActiveStep(readyToLaunch, true, false)).toBe(4);
  });

  it("detects when a session is live", () => {
    expect(isSessionLive(buildSession())).toBe(false);
    expect(isSessionLive(buildSession({ approvalStatus: "approved" }))).toBe(true);
    expect(
      isSessionLive(
        buildSession({
          activation: {
            status: "scheduled",
            brandMemorySync: true,
            summary: "",
            weekPlan: [],
            drafts: [
              {
                draftId: "draft-1",
                channel: "x",
                hook: "Hook",
                body: "Body",
                rationale: "Why",
                scheduleStatus: "scheduled"
              }
            ]
          }
        })
      )
    ).toBe(true);
  });

  it("builds live status from schedules and inbox items", () => {
    const status = getLiveStatus({
      xConnectionStatus: { connected: true },
      linkedinConnectionStatus: { connected: true },
      schedules: [buildSchedule(), buildSchedule({ id: "sch-2", channel: "linkedin" })],
      communityItems: [
        {
          id: "c-1",
          platform: "x",
          author: "user",
          message: "hello",
          sentiment: "neutral",
          linkedPostRef: "sch-1",
          status: "pending",
          createdAt: "2026-04-03T00:00:00.000Z"
        },
        {
          id: "c-2",
          platform: "linkedin",
          author: "user",
          message: "done",
          sentiment: "positive",
          linkedPostRef: "sch-2",
          status: "replied",
          createdAt: "2026-04-03T00:00:00.000Z"
        }
      ]
    });

    expect(status.connectedAccounts).toEqual(["X", "LinkedIn"]);
    expect(status.repliesWaiting).toBe(1);
    expect(status.nextPost?.id).toBe("sch-1");
  });

  it("summarizes weekly growth from published schedules", () => {
    const publishedAt = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
    const summary = summarizeWeeklyGrowth([
      buildSchedule({
        id: "sch-published",
        status: "published",
        publishedAt,
        timeline: [
          {
            capturedAt: publishedAt,
            likes: 12,
            replies: 3,
            quotes: 2,
            comments: 0,
            totalEngagement: 17
          }
        ]
      })
    ]);

    expect(summary).toContain("1 published posts");
    expect(summary).toContain("17 total engagements");
  });

  it("maps step state correctly", () => {
    expect(getStepState(3, 1)).toBe("complete");
    expect(getStepState(3, 3)).toBe("current");
    expect(getStepState(3, 4)).toBe("upcoming");
  });
});
