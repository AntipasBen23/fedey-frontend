import type { BrandMemoryProfile } from "@/lib/contracts/brand-memory";
import type { ContentDraft } from "@/lib/contracts/content";
import type { PublishingSchedule } from "@/lib/contracts/publishing";
import type { StrategySnapshot } from "@/lib/api/client";
import type { ExperimentSnapshot } from "@/lib/contracts/strategy";
import type { TrendSignal } from "@/lib/contracts/trends";
import { BrandMemoryPanel } from "@/features/brand-memory/brand-memory-panel";
import { ContentPanel } from "@/features/content/content-panel";
import { ExperimentsPanel } from "@/features/experiments/experiments-panel";
import { PublishingPanel } from "@/features/publishing/publishing-panel";
import { RecommendationsPanel } from "@/features/recommendations/recommendations-panel";
import { StrategyPanel } from "@/features/strategy/strategy-panel";
import { TrendsPanel } from "@/features/trends/trends-panel";

type DashboardShellProps = {
  brandMemory: BrandMemoryProfile;
  trends: TrendSignal[];
  drafts: ContentDraft[];
  schedules: PublishingSchedule[];
  snapshot: StrategySnapshot;
  experiments: ExperimentSnapshot[];
  onSaveBrandMemory: (formData: FormData) => Promise<void>;
  onCreateTrend: (formData: FormData) => Promise<void>;
  onGenerateDrafts: () => Promise<void>;
  onGenerateVariants: (formData: FormData) => Promise<void>;
  onCreateSchedule: (formData: FormData) => Promise<void>;
  onMarkPublished: (formData: FormData) => Promise<void>;
  onCreateExperiment: (formData: FormData) => Promise<void>;
  onRecordAnalyticsEvent: (formData: FormData) => Promise<void>;
};

export function DashboardShell({
  brandMemory,
  trends,
  drafts,
  schedules,
  snapshot,
  experiments,
  onSaveBrandMemory,
  onCreateTrend,
  onGenerateDrafts,
  onGenerateVariants,
  onCreateSchedule,
  onMarkPublished,
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
