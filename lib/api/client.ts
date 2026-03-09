import type {
  ExperimentSnapshot,
  Hypothesis,
  StrategyRecommendation
} from "@/lib/contracts/strategy";

export type StrategySnapshot = {
  hypotheses: Hypothesis[];
  experiments: ExperimentSnapshot[];
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
    experiments: [
      {
        id: "exp-11",
        hypothesisId: "hyp-01",
        metric: "engagement_rate",
        status: "running"
      },
      {
        id: "exp-12",
        hypothesisId: "hyp-02",
        metric: "save_rate",
        status: "draft"
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
