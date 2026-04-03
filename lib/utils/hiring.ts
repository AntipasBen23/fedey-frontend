import type { CommunityItem } from "@/lib/contracts/community";
import type { LinkedInConnectionStatus, XConnectionStatus } from "@/lib/contracts/integrations";
import type { OnboardingSession } from "@/lib/contracts/onboarding";
import type { PublishingSchedule } from "@/lib/contracts/publishing";

export type StepState = "complete" | "current" | "upcoming";

export type LiveStatus = {
  nextPost?: PublishingSchedule;
  connectedAccounts: string[];
  repliesWaiting: number;
  weeklyGrowthSummary: string;
};

export function getActiveStep(
  session: OnboardingSession | undefined,
  xConnected: boolean,
  linkedinConnected: boolean
): number {
  if (!session) {
    return 1;
  }
  if (!xConnected && !linkedinConnected) {
    return 2;
  }
  if (session.questions.some((question) => !question.answer)) {
    return 3;
  }
  return 4;
}

export function getStepState(activeStep: number, step: number): StepState {
  if (step < activeStep) {
    return "complete";
  }
  if (step === activeStep) {
    return "current";
  }
  return "upcoming";
}

export function isSessionLive(session: OnboardingSession | undefined): boolean {
  if (!session) {
    return false;
  }
  return (
    session.approvalStatus === "approved" ||
    session.activation.drafts.some((draft) => draft.scheduleStatus === "scheduled" || draft.scheduleStatus === "published")
  );
}

export function getLiveStatus(input: {
  xConnectionStatus: XConnectionStatus;
  linkedinConnectionStatus: LinkedInConnectionStatus;
  schedules: PublishingSchedule[];
  communityItems: CommunityItem[];
}): LiveStatus {
  const now = Date.now();
  const nextPost = [...input.schedules]
    .filter((schedule) => new Date(schedule.scheduledFor).getTime() >= now)
    .sort((left, right) => new Date(left.scheduledFor).getTime() - new Date(right.scheduledFor).getTime())[0];

  const connectedAccounts = [
    input.xConnectionStatus.connected ? "X" : null,
    input.linkedinConnectionStatus.connected ? "LinkedIn" : null
  ].filter(Boolean) as string[];

  return {
    nextPost,
    connectedAccounts,
    repliesWaiting: input.communityItems.filter((item) => item.status !== "replied").length,
    weeklyGrowthSummary: summarizeWeeklyGrowth(input.schedules)
  };
}

export function summarizeWeeklyGrowth(schedules: PublishingSchedule[]): string {
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const recentPublished = schedules.filter((schedule) => {
    if (!schedule.publishedAt) {
      return false;
    }
    return new Date(schedule.publishedAt).getTime() >= weekAgo;
  });

  if (recentPublished.length === 0) {
    return "No published posts yet this week. The first performance summary appears after the first live posts land.";
  }

  const totalEngagement = recentPublished.reduce((sum, schedule) => {
    const latestPoint = schedule.timeline?.[schedule.timeline.length - 1];
    return sum + (latestPoint?.totalEngagement ?? 0);
  }, 0);
  const syncedPosts = recentPublished.filter((schedule) => (schedule.timeline?.length ?? 0) > 0).length;

  return `${recentPublished.length} published posts, ${syncedPosts} with live tracking, ${totalEngagement} total engagements captured so far.`;
}
