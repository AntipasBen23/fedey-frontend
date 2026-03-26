export type AutomationRun = {
  id: string;
  status: string;
  draftsGenerated: number;
  schedulesCreated: number;
  mentionsSynced: number;
  repliesDrafted: number;
  triggeredBy: string;
  notes: string;
  createdAt: string;
};
