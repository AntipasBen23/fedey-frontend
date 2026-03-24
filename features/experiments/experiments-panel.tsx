import type { ExperimentSnapshot } from "@/lib/contracts/strategy";

type ExperimentsPanelProps = {
  experiments: ExperimentSnapshot[];
  onCreateExperiment: (formData: FormData) => Promise<void>;
  onRecordAnalyticsEvent: (formData: FormData) => Promise<void>;
};

export function ExperimentsPanel({
  experiments,
  onCreateExperiment,
  onRecordAnalyticsEvent
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
      <form className="experiment-form event-form" action={onRecordAnalyticsEvent}>
        <label>
          Experiment ID
          <input
            type="text"
            name="experimentId"
            placeholder="exp-11"
            required
            minLength={3}
          />
        </label>
        <label>
          Variant
          <input type="text" name="variant" placeholder="A" required minLength={1} />
        </label>
        <label>
          Metric Value
          <input
            type="number"
            step="0.01"
            min="0"
            name="value"
            placeholder="7.4"
            required
          />
        </label>
        <button type="submit">Record Event</button>
      </form>
      <ul className="stack-list">
        {experiments.map((experiment) => (
          <li key={experiment.id} className="list-item">
            <div className="experiment-copy">
              <p className="item-title">{experiment.id}</p>
              <p className="item-subtitle">
                Hypothesis: {experiment.hypothesisId} | Metric: {experiment.metric}
              </p>
              {experiment.summary ? (
                <div className="summary-block">
                  <p className="summary-title">
                    Winner: {experiment.summary.winnerVariant ?? "Pending"} | Confidence:{" "}
                    {Math.round(experiment.summary.confidence * 100)}%
                  </p>
                  <ul className="variant-list">
                    {experiment.summary.variants.map((variant) => (
                      <li key={`${experiment.id}-${variant.variant}`}>
                        {variant.variant}: avg {variant.averageValue} across {variant.events} events
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="item-subtitle">No analytics events recorded yet.</p>
              )}
            </div>
            <span className={`status status-${experiment.status}`}>{experiment.status}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
