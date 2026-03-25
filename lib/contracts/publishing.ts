export type PublishingSchedule = {
  id: string;
  draftId: string;
  variantLabel?: string;
  channel: string;
  scheduledFor: string;
  status: "scheduled" | "published";
  publishedAt?: string;
  createdAt: string;
};
