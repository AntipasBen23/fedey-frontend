import type { BrandMemoryProfile } from "@/lib/contracts/brand-memory";
import type { StrategySnapshot } from "@/lib/api/client";
import type { ExperimentSnapshot } from "@/lib/contracts/strategy";
import { BrandMemoryPanel } from "@/features/brand-memory/brand-memory-panel";
import { ExperimentsPanel } from "@/features/experiments/experiments-panel";
import { RecommendationsPanel } from "@/features/recommendations/recommendations-panel";
import { StrategyPanel } from "@/features/strategy/strategy-panel";

type DashboardShellProps = {
  brandMemory: BrandMemoryProfile;
  snapshot: StrategySnapshot;
  experiments: ExperimentSnapshot[];
  onSaveBrandMemory: (formData: FormData) => Promise<void>;
  onCreateExperiment: (formData: FormData) => Promise<void>;
  onRecordAnalyticsEvent: (formData: FormData) => Promise<void>;
};

export function DashboardShell({
  brandMemory,
  snapshot,
  experiments,
  onSaveBrandMemory,
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
