export type Hypothesis = {
  id: string;
  statement: string;
  channel: "x" | "linkedin" | "instagram" | "tiktok";
  confidence: number;
};

export type ExperimentSnapshot = {
  id: string;
  hypothesisId: string;
  metric: string;
  status: "draft" | "running" | "completed";
  summary?: {
    winnerVariant?: string;
    winnerScore: number;
    confidence: number;
    variants: Array<{
      variant: string;
      events: number;
      totalValue: number;
      averageValue: number;
    }>;
  };
};

export type StrategyRecommendation = {
  id: string;
  title: string;
  detail: string;
  impactScore: number;
};
