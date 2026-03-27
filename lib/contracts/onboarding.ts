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
  lastRunAt?: string;
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
  questions: OnboardingQuestion[];
  audit: OnboardingAudit;
  status: string;
  createdAt: string;
  updatedAt: string;
};
