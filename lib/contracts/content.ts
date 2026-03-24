export type ContentDraft = {
  id: string;
  channel: string;
  hook: string;
  body: string;
  rationale: string;
  sourceTrend: string;
  experimentId?: string;
  variants?: Array<{
    label: string;
    hook: string;
    body: string;
    angle: string;
  }>;
  status: string;
  createdAt: string;
};
