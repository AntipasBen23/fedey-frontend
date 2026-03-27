export type PublishingSchedule = {
  id: string;
  draftId: string;
  variantLabel?: string;
  channel: string;
  queueProfile: string;
  platformPostId?: string;
  scheduledFor: string;
  status: "scheduled" | "published";
  publishedAt?: string;
  performanceSyncedAt?: string;
  timeline?: Array<{
    capturedAt: string;
    likes: number;
    replies: number;
    quotes: number;
    comments: number;
    totalEngagement: number;
  }>;
  createdAt: string;
};
