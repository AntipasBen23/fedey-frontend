export type AutomationRun = {
  id: string;
  status: string;
  draftsGenerated: number;
  schedulesCreated: number;
  repliesDrafted: number;
  triggeredBy: string;
  notes: string;
  createdAt: string;
};
