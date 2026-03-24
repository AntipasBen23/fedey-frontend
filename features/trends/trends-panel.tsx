import type { TrendSignal } from "@/lib/contracts/trends";

type TrendsPanelProps = {
  trends: TrendSignal[];
  onCreateTrend: (formData: FormData) => Promise<void>;
};

export function TrendsPanel({ trends, onCreateTrend }: TrendsPanelProps) {
  return (
    <section className="card trend-card">
      <header className="section-header">
        <h2>Trend Radar</h2>
        <p>Signals the agent can observe and turn into strategy hypotheses.</p>
      </header>
      <form className="trend-form" action={onCreateTrend}>
        <label>
          Topic
          <input type="text" name="topic" placeholder="AI employees" required />
        </label>
        <label>
          Source
          <input type="text" name="source" placeholder="x" required />
        </label>
        <label>
          Angle
          <input
            type="text"
            name="angle"
            placeholder="People want implementation details, not theory"
            required
          />
        </label>
        <label>
          Velocity
          <input type="number" min="0" name="velocity" placeholder="80" required />
        </label>
        <label>
          Relevance
          <input type="number" min="0" max="1" step="0.01" name="relevance" placeholder="0.90" required />
        </label>
        <button type="submit">Add Trend Signal</button>
      </form>
      <ul className="stack-list">
        {trends.map((trend) => (
          <li key={trend.id} className="list-item">
            <div className="trend-copy">
              <p className="item-title">{trend.topic}</p>
              <p className="item-subtitle">
                {trend.source.toUpperCase()} | Velocity {trend.velocity} | Relevance{" "}
                {Math.round(trend.relevance * 100)}%
              </p>
              <p className="trend-angle">{trend.angle}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
