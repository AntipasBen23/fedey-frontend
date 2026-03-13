import type { ExperimentSnapshot } from "@/lib/contracts/strategy";

type ExperimentsPanelProps = {
  experiments: ExperimentSnapshot[];
  onCreateExperiment: (formData: FormData) => Promise<void>;
};

export function ExperimentsPanel({
  experiments,
  onCreateExperiment
}: ExperimentsPanelProps) {
  return (
    <section className="card">
      <header className="section-header">
        <h2>Experiment Lab</h2>
        <p>Every test is tied to a hypothesis and measured against one objective.</p>
      </header>
      <form className="experiment-form" action={onCreateExperiment}>
        <label>
          Hypothesis ID
          <input
            type="text"
            name="hypothesisId"
            placeholder="hyp-01"
            required
            minLength={3}
          />
        </label>
        <label>
          Primary Metric
          <input
            type="text"
            name="metric"
            placeholder="engagement_rate"
            required
            minLength={3}
          />
        </label>
        <button type="submit">Create Experiment</button>
      </form>
      <ul className="stack-list">
        {experiments.map((experiment) => (
          <li key={experiment.id} className="list-item">
            <div>
              <p className="item-title">{experiment.id}</p>
              <p className="item-subtitle">
                Hypothesis: {experiment.hypothesisId} | Metric: {experiment.metric}
              </p>
            </div>
            <span className={`status status-${experiment.status}`}>{experiment.status}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
