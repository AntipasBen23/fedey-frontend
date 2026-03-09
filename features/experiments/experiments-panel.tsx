import type { ExperimentSnapshot } from "@/lib/contracts/strategy";

type ExperimentsPanelProps = {
  experiments: ExperimentSnapshot[];
};

export function ExperimentsPanel({ experiments }: ExperimentsPanelProps) {
  return (
    <section className="card">
      <header className="section-header">
        <h2>Experiment Lab</h2>
        <p>Every test is tied to a hypothesis and measured against one objective.</p>
      </header>
      <ul className="stack-list">
        {experiments.map((experiment) => (
          <li key={experiment.id} className="list-item">
            <div>
              <p className="item-title">{experiment.id}</p>
              <p className="item-subtitle">
                Hypothesis: {experiment.hypothesisId} • Metric: {experiment.metric}
              </p>
            </div>
            <span className={`status status-${experiment.status}`}>{experiment.status}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
