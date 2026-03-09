import type { StrategySnapshot } from "@/lib/api/client";
import { ExperimentsPanel } from "@/features/experiments/experiments-panel";
import { RecommendationsPanel } from "@/features/recommendations/recommendations-panel";
import { StrategyPanel } from "@/features/strategy/strategy-panel";

type DashboardShellProps = {
  snapshot: StrategySnapshot;
};

export function DashboardShell({ snapshot }: DashboardShellProps) {
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
        <StrategyPanel hypotheses={snapshot.hypotheses} />
        <ExperimentsPanel experiments={snapshot.experiments} />
        <RecommendationsPanel recommendations={snapshot.recommendations} />
      </section>
    </main>
  );
}
