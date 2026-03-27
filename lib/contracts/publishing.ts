export type PublishingSchedule = {
  id: string;
  draftId: string;
  variantLabel?: string;
  channel: string;
  platformPostId?: string;
  scheduledFor: string;
  status: "scheduled" | "published";
  publishedAt?: string;
  performanceSyncedAt?: string;
  createdAt: string;
};
