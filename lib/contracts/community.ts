export type CommunityItem = {
  id: string;
  platform: string;
  author: string;
  message: string;
  sentiment: string;
  replyDraft?: string;
  linkedPostRef: string;
  status: "pending" | "drafted" | "replied";
  createdAt: string;
  repliedAt?: string;
};
