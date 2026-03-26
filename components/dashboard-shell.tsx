import type { AutomationRun } from "@/lib/contracts/automation";
import type { BrandMemoryProfile } from "@/lib/contracts/brand-memory";
import type { CommunityItem } from "@/lib/contracts/community";
import type { ContentDraft } from "@/lib/contracts/content";
import type { XConnectionStatus } from "@/lib/contracts/integrations";
import type { PublishingSchedule } from "@/lib/contracts/publishing";
import type { StrategySnapshot } from "@/lib/api/client";
import type { ExperimentSnapshot } from "@/lib/contracts/strategy";
import type { TrendSignal } from "@/lib/contracts/trends";
import { AutomationPanel } from "@/features/automation/automation-panel";
import { BrandMemoryPanel } from "@/features/brand-memory/brand-memory-panel";
import { CommunityPanel } from "@/features/community/community-panel";
import { ContentPanel } from "@/features/content/content-panel";
import { ExperimentsPanel } from "@/features/experiments/experiments-panel";
import { XConnectionPanel } from "@/features/integrations/x-connection-panel";
import { PublishingPanel } from "@/features/publishing/publishing-panel";
import { RecommendationsPanel } from "@/features/recommendations/recommendations-panel";
import { StrategyPanel } from "@/features/strategy/strategy-panel";
import { TrendsPanel } from "@/features/trends/trends-panel";

type DashboardShellProps = {
  brandMemory: BrandMemoryProfile;
  xConnectionStatus: XConnectionStatus;
  xConnectUrl: string;
  trends: TrendSignal[];
  drafts: ContentDraft[];
  schedules: PublishingSchedule[];
  communityItems: CommunityItem[];
  automationRuns: AutomationRun[];
  snapshot: StrategySnapshot;
  experiments: ExperimentSnapshot[];
  onSaveBrandMemory: (formData: FormData) => Promise<void>;
  onCreateTrend: (formData: FormData) => Promise<void>;
  onGenerateDrafts: () => Promise<void>;
  onGenerateVariants: (formData: FormData) => Promise<void>;
  onCreateSchedule: (formData: FormData) => Promise<void>;
  onMarkPublished: (formData: FormData) => Promise<void>;
  onCreateInboxItem: (formData: FormData) => Promise<void>;
  onSyncXMentions: () => Promise<void>;
  onDraftReply: (formData: FormData) => Promise<void>;
  onMarkReplied: (formData: FormData) => Promise<void>;
  onRunAutomationNow: () => Promise<void>;
  onCreateExperiment: (formData: FormData) => Promise<void>;
  onRecordAnalyticsEvent: (formData: FormData) => Promise<void>;
};

export function DashboardShell({
  brandMemory,
  xConnectionStatus,
  xConnectUrl,
  trends,
  drafts,
  schedules,
  communityItems,
  automationRuns,
  snapshot,
  experiments,
  onSaveBrandMemory,
  onCreateTrend,
  onGenerateDrafts,
  onGenerateVariants,
  onCreateSchedule,
  onMarkPublished,
  onCreateInboxItem,
  onSyncXMentions,
  onDraftReply,
  onMarkReplied,
  onRunAutomationNow,
  onCreateExperiment,
  onRecordAnalyticsEvent
}: DashboardShellProps) {
  return (
    <main className="page">
      <section className="hero">
        <p className="badge">Fedey Growth Console</p>
        <h1>AI Social Manager, Built as a Learning System</h1>
        <p>
          The agent runs a continuous growth loop: observe, hypothesize, experiment,
          measure, and adapt.
        </p>
      </section>

      <section className="grid">
        <XConnectionPanel status={xConnectionStatus} connectUrl={xConnectUrl} />
        <BrandMemoryPanel profile={brandMemory} onSave={onSaveBrandMemory} />
        <TrendsPanel trends={trends} onCreateTrend={onCreateTrend} />
        <ContentPanel
          drafts={drafts}
          onGenerateDrafts={onGenerateDrafts}
          onGenerateVariants={onGenerateVariants}
        />
        <PublishingPanel
          drafts={drafts}
          schedules={schedules}
          onCreateSchedule={onCreateSchedule}
          onMarkPublished={onMarkPublished}
        />
        <CommunityPanel
          items={communityItems}
          onCreateInboxItem={onCreateInboxItem}
          onSyncXMentions={onSyncXMentions}
          onDraftReply={onDraftReply}
          onMarkReplied={onMarkReplied}
        />
        <AutomationPanel runs={automationRuns} onRunNow={onRunAutomationNow} />
        <StrategyPanel hypotheses={snapshot.hypotheses} />
        <ExperimentsPanel
          experiments={experiments}
          onCreateExperiment={onCreateExperiment}
          onRecordAnalyticsEvent={onRecordAnalyticsEvent}
        />
        <RecommendationsPanel recommendations={snapshot.recommendations} />
      </section>
    </main>
  );
}
