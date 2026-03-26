export type AutomationRun = {
  id: string;
  status: string;
  draftsGenerated: number;
  schedulesCreated: number;
  postsPublished: number;
  signalsIngested: number;
  mentionsSynced: number;
  repliesDrafted: number;
  triggeredBy: string;
  notes: string;
  createdAt: string;
};

export type AutomationSettings = {
  interval: string;
  windows: Array<{
    hour: number;
    minute: number;
    label: string;
  }>;
};
