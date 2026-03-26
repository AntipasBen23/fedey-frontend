import type { AutomationRun } from "@/lib/contracts/automation";
import type { BrandMemoryProfile } from "@/lib/contracts/brand-memory";
import type { CommunityItem } from "@/lib/contracts/community";
import type { ContentDraft } from "@/lib/contracts/content";
import type { XConnectionStatus } from "@/lib/contracts/integrations";
import type { PublishingSchedule } from "@/lib/contracts/publishing";
import type {
  ExperimentSnapshot,
  Hypothesis,
  StrategyRecommendation
} from "@/lib/contracts/strategy";
import type { TrendSignal } from "@/lib/contracts/trends";

export type StrategySnapshot = {
  hypotheses: Hypothesis[];
  recommendations: StrategyRecommendation[];
};

export async function getStrategySnapshot(): Promise<StrategySnapshot> {
  const apiBaseUrl = process.env.FEDEY_API_URL;

  if (!apiBaseUrl) {
    return fallbackSnapshot();
  }

  try {
    const response = await fetch(`${apiBaseUrl}/v1/strategy/snapshot`, {
      cache: "no-store"
    });

    if (!response.ok) {
      return fallbackSnapshot();
    }

    return (await response.json()) as StrategySnapshot;
  } catch {
    return fallbackSnapshot();
  }
}

export async function getBrandMemory(): Promise<BrandMemoryProfile> {
  const apiBaseUrl = process.env.FEDEY_API_URL;
  if (!apiBaseUrl) {
    return fallbackBrandMemory();
  }

  try {
    const response = await fetch(`${apiBaseUrl}/v1/brand-memory`, {
      cache: "no-store"
    });
    if (!response.ok) {
      return fallbackBrandMemory();
    }

    return (await response.json()) as BrandMemoryProfile;
  } catch {
    return fallbackBrandMemory();
  }
}

type ListTrendsResponse = {
  items: TrendSignal[];
};

type ListDraftsResponse = {
  items: ContentDraft[];
};

type ListSchedulesResponse = {
  items: PublishingSchedule[];
};

type ListCommunityResponse = {
  items: CommunityItem[];
};

type ListAutomationResponse = {
  items: AutomationRun[];
};

export async function getTrends(): Promise<TrendSignal[]> {
  const apiBaseUrl = process.env.FEDEY_API_URL;
  if (!apiBaseUrl) {
    return fallbackTrends();
  }

  try {
    const response = await fetch(`${apiBaseUrl}/v1/trends`, {
      cache: "no-store"
    });
    if (!response.ok) {
      return fallbackTrends();
    }

    const payload = (await response.json()) as ListTrendsResponse;
    return payload.items;
  } catch {
    return fallbackTrends();
  }
}

export async function createTrend(input: {
  topic: string;
  source: string;
  angle: string;
  velocity: number;
  relevance: number;
}): Promise<void> {
  const apiBaseUrl = process.env.FEDEY_API_URL;
  if (!apiBaseUrl) {
    return;
  }

  const response = await fetch(`${apiBaseUrl}/v1/trends`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(input),
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error("failed to create trend");
  }
}

export async function getContentDrafts(): Promise<ContentDraft[]> {
  const apiBaseUrl = process.env.FEDEY_API_URL;
  if (!apiBaseUrl) {
    return fallbackContentDrafts();
  }

  try {
    const response = await fetch(`${apiBaseUrl}/v1/content/drafts`, {
      cache: "no-store"
    });
    if (!response.ok) {
      return fallbackContentDrafts();
    }

    const payload = (await response.json()) as ListDraftsResponse;
    return payload.items;
  } catch {
    return fallbackContentDrafts();
  }
}

export async function generateContentDrafts(): Promise<void> {
  const apiBaseUrl = process.env.FEDEY_API_URL;
  if (!apiBaseUrl) {
    return;
  }

  const response = await fetch(`${apiBaseUrl}/v1/content/drafts/generate`, {
    method: "POST",
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error("failed to generate content drafts");
  }
}

export async function generateDraftVariants(draftId: string): Promise<void> {
  const apiBaseUrl = process.env.FEDEY_API_URL;
  if (!apiBaseUrl) {
    return;
  }

  const response = await fetch(`${apiBaseUrl}/v1/content/drafts/${draftId}/variants/generate`, {
    method: "POST",
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error("failed to generate draft variants");
  }
}

export async function getPublishingSchedules(): Promise<PublishingSchedule[]> {
  const apiBaseUrl = process.env.FEDEY_API_URL;
  if (!apiBaseUrl) {
    return fallbackPublishingSchedules();
  }

  try {
    const response = await fetch(`${apiBaseUrl}/v1/publishing/schedules`, {
      cache: "no-store"
    });
    if (!response.ok) {
      return fallbackPublishingSchedules();
    }

    const payload = (await response.json()) as ListSchedulesResponse;
    return payload.items;
  } catch {
    return fallbackPublishingSchedules();
  }
}

export async function createPublishingSchedule(input: {
  draftId: string;
  variantLabel: string;
  channel: string;
  scheduledFor: string;
}): Promise<void> {
  const apiBaseUrl = process.env.FEDEY_API_URL;
  if (!apiBaseUrl) {
    return;
  }

  const response = await fetch(`${apiBaseUrl}/v1/publishing/schedules`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(input),
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error("failed to create publishing schedule");
  }
}

export async function markPublishingSchedulePublished(scheduleId: string): Promise<void> {
  const apiBaseUrl = process.env.FEDEY_API_URL;
  if (!apiBaseUrl) {
    return;
  }

  const response = await fetch(`${apiBaseUrl}/v1/publishing/schedules/${scheduleId}/publish`, {
    method: "PATCH",
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error("failed to mark publishing schedule published");
  }
}

export async function getCommunityInbox(): Promise<CommunityItem[]> {
  const apiBaseUrl = process.env.FEDEY_API_URL;
  if (!apiBaseUrl) {
    return fallbackCommunityInbox();
  }

  try {
    const response = await fetch(`${apiBaseUrl}/v1/community/inbox`, {
      cache: "no-store"
    });
    if (!response.ok) {
      return fallbackCommunityInbox();
    }

    const payload = (await response.json()) as ListCommunityResponse;
    return payload.items;
  } catch {
    return fallbackCommunityInbox();
  }
}

export async function createCommunityInboxItem(input: {
  platform: string;
  author: string;
  message: string;
  sentiment: string;
  linkedPostRef: string;
  externalCommentId?: string;
}): Promise<void> {
  const apiBaseUrl = process.env.FEDEY_API_URL;
  if (!apiBaseUrl) {
    return;
  }

  const response = await fetch(`${apiBaseUrl}/v1/community/inbox`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(input),
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error("failed to create community inbox item");
  }
}

export async function draftCommunityReply(itemId: string): Promise<void> {
  const apiBaseUrl = process.env.FEDEY_API_URL;
  if (!apiBaseUrl) {
    return;
  }

  const response = await fetch(`${apiBaseUrl}/v1/community/inbox/${itemId}/draft-reply`, {
    method: "POST",
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error("failed to draft community reply");
  }
}

export async function syncXCommunityInbox(): Promise<void> {
  const apiBaseUrl = process.env.FEDEY_API_URL;
  if (!apiBaseUrl) {
    return;
  }

  const response = await fetch(`${apiBaseUrl}/v1/community/inbox/sync/x`, {
    method: "POST",
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error("failed to sync x community inbox");
  }
}

export async function markCommunityReplySent(itemId: string): Promise<void> {
  const apiBaseUrl = process.env.FEDEY_API_URL;
  if (!apiBaseUrl) {
    return;
  }

  const response = await fetch(`${apiBaseUrl}/v1/community/inbox/${itemId}/reply`, {
    method: "PATCH",
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error("failed to mark community reply sent");
  }
}

export async function getAutomationRuns(): Promise<AutomationRun[]> {
  const apiBaseUrl = process.env.FEDEY_API_URL;
  if (!apiBaseUrl) {
    return fallbackAutomationRuns();
  }

  try {
    const response = await fetch(`${apiBaseUrl}/v1/automation/runs`, {
      cache: "no-store"
    });
    if (!response.ok) {
      return fallbackAutomationRuns();
    }

    const payload = (await response.json()) as ListAutomationResponse;
    return payload.items;
  } catch {
    return fallbackAutomationRuns();
  }
}

export async function runAutomationNow(): Promise<void> {
  const apiBaseUrl = process.env.FEDEY_API_URL;
  if (!apiBaseUrl) {
    return;
  }

  const response = await fetch(`${apiBaseUrl}/v1/automation/run`, {
    method: "POST",
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error("failed to run automation");
  }
}

export async function getXConnectionStatus(): Promise<XConnectionStatus> {
  const apiBaseUrl = process.env.FEDEY_API_URL;
  if (!apiBaseUrl) {
    return fallbackXConnectionStatus();
  }

  try {
    const response = await fetch(`${apiBaseUrl}/v1/integrations/x/status`, {
      cache: "no-store"
    });
    if (!response.ok) {
      return fallbackXConnectionStatus();
    }

    return (await response.json()) as XConnectionStatus;
  } catch {
    return fallbackXConnectionStatus();
  }
}

export async function updateBrandMemory(input: {
  brandName: string;
  tone: string;
  audience: string;
  pillars: string[];
  guardrails: string[];
}): Promise<void> {
  const apiBaseUrl = process.env.FEDEY_API_URL;
  if (!apiBaseUrl) {
    return;
  }

  const response = await fetch(`${apiBaseUrl}/v1/brand-memory`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(input),
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error("failed to update brand memory");
  }
}

function fallbackSnapshot(): StrategySnapshot {
  return {
    hypotheses: [
      {
        id: "hyp-01",
        statement: "Educational threads will outperform product-first posts this week",
        channel: "x",
        confidence: 0.78
      },
      {
        id: "hyp-02",
        statement: "Posting short carousel explainers at noon will improve saves",
        channel: "instagram",
        confidence: 0.71
      }
    ],
    recommendations: [
      {
        id: "rec-4",
        title: "Increase educational share",
        detail: "Accounts in your segment saw 1.9x higher reach with educational content this week.",
        impactScore: 89
      },
      {
        id: "rec-5",
        title: "Compress publish window",
        detail: "Top variants peaked between 11:30 and 13:00 local time.",
        impactScore: 72
      }
    ]
  };
}

function fallbackBrandMemory(): BrandMemoryProfile {
  return {
    id: "default",
    brandName: "Fedey",
    tone: "Clear, strategic, confident, and human.",
    audience: "Founders, creators, and businesses that want AI employees for growth.",
    pillars: ["AI agents", "social growth systems", "automation strategy"],
    guardrails: ["No spammy hooks", "No misleading claims", "No off-brand slang"],
    updatedAt: new Date().toISOString()
  };
}

function fallbackTrends(): TrendSignal[] {
  return [
    {
      id: "trd-1",
      topic: "AI employees replacing specialist roles",
      source: "x",
      angle: "Operators are asking what a reliable AI social manager stack looks like.",
      velocity: 84,
      relevance: 0.92,
      observedAt: new Date().toISOString()
    },
    {
      id: "trd-2",
      topic: "Founders documenting systems publicly",
      source: "linkedin",
      angle: "Process breakdowns and build-in-public posts are getting unusually strong saves.",
      velocity: 67,
      relevance: 0.81,
      observedAt: new Date().toISOString()
    }
  ];
}

function fallbackContentDrafts(): ContentDraft[] {
  return [
    {
      id: "draft-1",
      channel: "x",
      hook: "Trend signal: AI employees are opening a content angle for Fedey.",
      body: "People are talking about AI employees.\n\nHere is the interesting part: the real opportunity is not just posting about it. It is building a system that can test angles around it, measure response, and compound what works for Fedey.",
      rationale: "Generated from X with high relevance.",
      sourceTrend: "AI employees replacing specialist roles",
      experimentId: "exp-demo-1",
      variants: [
        {
          label: "A",
          hook: "Trend signal: AI employees are opening a content angle for Fedey.",
          body: "People are talking about AI employees.\n\nHere is the interesting part: the real opportunity is not just posting about it. It is building a system that can test angles around it, measure response, and compound what works for Fedey.",
          angle: "Baseline explanatory angle"
        },
        {
          label: "B",
          hook: "What most teams miss about this trend",
          body: "People are talking about AI employees.\n\nHere is the interesting part: the real opportunity is not just posting about it. It is building a system that can test angles around it, measure response, and compound what works for Fedey.\n\nThe test here is whether a sharper contrarian opening earns more engagement.",
          angle: "Contrarian hook"
        }
      ],
      status: "variant_ready",
      createdAt: new Date().toISOString()
    }
  ];
}

function fallbackPublishingSchedules(): PublishingSchedule[] {
  return [
    {
      id: "sch-1",
      draftId: "draft-1",
      variantLabel: "B",
      channel: "x",
      platformPostId: "195-demo-post",
      scheduledFor: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      status: "scheduled",
      createdAt: new Date().toISOString()
    }
  ];
}

function fallbackCommunityInbox(): CommunityItem[] {
  return [
    {
      id: "cmt-1",
      platform: "x",
      author: "founder_ops",
      message: "This is exactly the kind of AI social operator stack I have been looking for. How would you keep replies on-brand?",
      sentiment: "positive",
      replyDraft: "Thanks founder_ops. Fedey would keep replies on-brand by grounding them in the same voice, audience, and guardrails stored in the agent memory, not by improvising randomly.",
      linkedPostRef: "sch-1",
      externalCommentId: "191-demo",
      status: "drafted",
      createdAt: new Date().toISOString()
    }
  ];
}

function fallbackAutomationRuns(): AutomationRun[] {
  return [
    {
      id: "run-1",
      status: "completed",
      draftsGenerated: 3,
      schedulesCreated: 1,
      mentionsSynced: 2,
      repliesDrafted: 1,
      triggeredBy: "manual",
      notes: "Generated 3 drafts, created 1 schedule, synced 2 mentions, drafted 1 reply.",
      createdAt: new Date().toISOString()
    }
  ];
}

function fallbackXConnectionStatus(): XConnectionStatus {
  return {
    connected: false
  };
}

type ListExperimentsResponse = {
  items: Array<{
    id: string;
    hypothesisId: string;
    metric: string;
    status: ExperimentSnapshot["status"];
    summary?: ExperimentSnapshot["summary"];
  }>;
};

export async function getExperiments(): Promise<ExperimentSnapshot[]> {
  const apiBaseUrl = process.env.FEDEY_API_URL;
  if (!apiBaseUrl) {
    return fallbackExperiments();
  }

  try {
    const response = await fetch(`${apiBaseUrl}/v1/experiments`, {
      cache: "no-store"
    });
    if (!response.ok) {
      return fallbackExperiments();
    }

    const payload = (await response.json()) as ListExperimentsResponse;
    return payload.items.map((item) => ({
      id: item.id,
      hypothesisId: item.hypothesisId,
      metric: item.metric,
      status: item.status,
      summary: item.summary
    }));
  } catch {
    return fallbackExperiments();
  }
}

export async function createExperiment(input: {
  hypothesisId: string;
  metric: string;
}): Promise<void> {
  const apiBaseUrl = process.env.FEDEY_API_URL;
  if (!apiBaseUrl) {
    return;
  }

  const response = await fetch(`${apiBaseUrl}/v1/experiments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(input),
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error("failed to create experiment");
  }
}

export async function recordAnalyticsEvent(input: {
  experimentId: string;
  variant: string;
  value: number;
}): Promise<void> {
  const apiBaseUrl = process.env.FEDEY_API_URL;
  if (!apiBaseUrl) {
    return;
  }

  const response = await fetch(`${apiBaseUrl}/v1/analytics/events`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(input),
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error("failed to record analytics event");
  }
}

function fallbackExperiments(): ExperimentSnapshot[] {
  return [
    {
      id: "exp-11",
      hypothesisId: "hyp-01",
      metric: "engagement_rate",
      status: "running",
      summary: {
        winnerVariant: "B",
        winnerScore: 7.4,
        confidence: 0.19,
        variants: [
          {
            variant: "B",
            events: 4,
            totalValue: 29.6,
            averageValue: 7.4
          },
          {
            variant: "A",
            events: 4,
            totalValue: 24.8,
            averageValue: 6.2
          }
        ]
      }
    },
    {
      id: "exp-12",
      hypothesisId: "hyp-02",
      metric: "save_rate",
      status: "draft"
    }
  ];
}
