export type OnboardingQuestion = {
  id: string;
  sessionId: string;
  prompt: string;
  category: string;
  answer?: string;
  required: boolean;
  createdAt: string;
  answeredAt?: string;
};

export type OnboardingAudit = {
  status: string;
  connectedPlatforms: string[];
  postsReviewed: number;
  replyPatterns: string[];
  contentPatterns: string[];
  recommendations: string[];
  performanceInsights: string[];
  lastRunAt?: string;
};

export type ActivationPlan = {
  status: string;
  brandMemorySync: boolean;
  drafts: Array<{
    draftId: string;
    channel: string;
    hook: string;
    body: string;
    rationale: string;
    scheduleId?: string;
    scheduleStatus?: string;
    scheduledFor?: string;
  }>;
  weekPlan: Array<{
    day: string;
    channel: string;
    focus: string;
    format: string;
    hypothesis: string;
  }>;
  summary: string;
  generatedAt?: string;
};

export type OnboardingHistoryEntry = {
  id: string;
  actor: string;
  action: string;
  description: string;
  createdAt: string;
};

export type OnboardingSession = {
  id: string;
  title: string;
  jobDescription: string;
  accountMode: string;
  objective: string;
  primaryPlatform: string;
  brandName: string;
  audience: string;
  voiceSummary: string;
  constraints: string[];
  reviewMode: string;
  approvalStatus: string;
  questions: OnboardingQuestion[];
  audit: OnboardingAudit;
  activation: ActivationPlan;
  history: OnboardingHistoryEntry[];
  status: string;
  createdAt: string;
  updatedAt: string;
};
