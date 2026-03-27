import type { AutomationRun, AutomationSettings } from "@/lib/contracts/automation";
import type { BrandMemoryProfile } from "@/lib/contracts/brand-memory";
import type { CommunityItem } from "@/lib/contracts/community";
import type { ContentDraft } from "@/lib/contracts/content";
import type { LinkedInConnectionStatus, XConnectionStatus } from "@/lib/contracts/integrations";
import type { OnboardingSession } from "@/lib/contracts/onboarding";
import type { PublishingSchedule } from "@/lib/contracts/publishing";
import type { StrategySnapshot } from "@/lib/api/client";
import type { ExperimentSnapshot } from "@/lib/contracts/strategy";
import type { TrendSignal } from "@/lib/contracts/trends";
import { AutomationPanel } from "@/features/automation/automation-panel";
import { BrandMemoryPanel } from "@/features/brand-memory/brand-memory-panel";
import { CommunityPanel } from "@/features/community/community-panel";
import { ContentPanel } from "@/features/content/content-panel";
import { ExperimentsPanel } from "@/features/experiments/experiments-panel";
import { LinkedInConnectionPanel } from "@/features/integrations/linkedin-connection-panel";
import { OnboardingPanel } from "@/features/onboarding/onboarding-panel";
import { XConnectionPanel } from "@/features/integrations/x-connection-panel";
import { PublishingPanel } from "@/features/publishing/publishing-panel";
import { RecommendationsPanel } from "@/features/recommendations/recommendations-panel";
import { StrategyPanel } from "@/features/strategy/strategy-panel";
import { TrendsPanel } from "@/features/trends/trends-panel";

type DashboardShellProps = {
  brandMemory: BrandMemoryProfile;
  xConnectionStatus: XConnectionStatus;
  linkedinConnectionStatus: LinkedInConnectionStatus;
  xConnectUrl: string;
  linkedinConnectUrl: string;
  onboardingSessions: OnboardingSession[];
  trends: TrendSignal[];
  drafts: ContentDraft[];
  schedules: PublishingSchedule[];
  communityItems: CommunityItem[];
  automationRuns: AutomationRun[];
  automationSettings: AutomationSettings;
  snapshot: StrategySnapshot;
  experiments: ExperimentSnapshot[];
  onSaveBrandMemory: (formData: FormData) => Promise<void>;
  onCreateOnboardingSession: (formData: FormData) => Promise<void>;
  onAnswerOnboardingQuestion: (formData: FormData) => Promise<void>;
  onUpdateOnboardingReviewMode: (formData: FormData) => Promise<void>;
  onRunOnboardingAudit: (formData: FormData) => Promise<void>;
  onActivateOnboardingSession: (formData: FormData) => Promise<void>;
  onApproveOnboardingSession: (formData: FormData) => Promise<void>;
  onCreateTrend: (formData: FormData) => Promise<void>;
  onIngestLiveTrends: (formData: FormData) => Promise<void>;
  onGenerateDrafts: () => Promise<void>;
  onGenerateVariants: (formData: FormData) => Promise<void>;
  onCreateSchedule: (formData: FormData) => Promise<void>;
  onMarkPublished: (formData: FormData) => Promise<void>;
  onCreateInboxItem: (formData: FormData) => Promise<void>;
  onSyncXMentions: () => Promise<void>;
  onSyncLinkedInComments: () => Promise<void>;
  onDraftReply: (formData: FormData) => Promise<void>;
  onMarkReplied: (formData: FormData) => Promise<void>;
  onRunAutomationNow: () => Promise<void>;
  onCreateExperiment: (formData: FormData) => Promise<void>;
  onRecordAnalyticsEvent: (formData: FormData) => Promise<void>;
};

export function DashboardShell({
  brandMemory,
  xConnectionStatus,
  linkedinConnectionStatus,
  xConnectUrl,
  linkedinConnectUrl,
  onboardingSessions,
  trends,
  drafts,
  schedules,
  communityItems,
  automationRuns,
  automationSettings,
  snapshot,
  experiments,
  onSaveBrandMemory,
  onCreateOnboardingSession,
  onAnswerOnboardingQuestion,
  onUpdateOnboardingReviewMode,
  onRunOnboardingAudit,
  onActivateOnboardingSession,
  onApproveOnboardingSession,
  onCreateTrend,
  onIngestLiveTrends,
  onGenerateDrafts,
  onGenerateVariants,
  onCreateSchedule,
  onMarkPublished,
  onCreateInboxItem,
  onSyncXMentions,
  onSyncLinkedInComments,
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
        <LinkedInConnectionPanel status={linkedinConnectionStatus} connectUrl={linkedinConnectUrl} />
        <OnboardingPanel
          sessions={onboardingSessions}
          onCreateSession={onCreateOnboardingSession}
          onAnswerQuestion={onAnswerOnboardingQuestion}
          onUpdateReviewMode={onUpdateOnboardingReviewMode}
          onRunAudit={onRunOnboardingAudit}
          onActivate={onActivateOnboardingSession}
          onApprove={onApproveOnboardingSession}
        />
        <BrandMemoryPanel profile={brandMemory} onSave={onSaveBrandMemory} />
        <TrendsPanel trends={trends} onCreateTrend={onCreateTrend} onIngestLiveTrends={onIngestLiveTrends} />
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
          onSyncLinkedInComments={onSyncLinkedInComments}
          onDraftReply={onDraftReply}
          onMarkReplied={onMarkReplied}
        />
        <AutomationPanel runs={automationRuns} settings={automationSettings} onRunNow={onRunAutomationNow} />
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
