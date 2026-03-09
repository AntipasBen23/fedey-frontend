import type { Hypothesis } from "@/lib/contracts/strategy";

type StrategyPanelProps = {
  hypotheses: Hypothesis[];
};

export function StrategyPanel({ hypotheses }: StrategyPanelProps) {
  return (
    <section className="card">
      <header className="section-header">
        <h2>Hypotheses</h2>
        <p>What the system believes is most likely to grow the account next.</p>
      </header>
      <ul className="stack-list">
        {hypotheses.map((item) => (
          <li key={item.id} className="list-item">
            <div>
              <p className="item-title">{item.statement}</p>
              <p className="item-subtitle">Channel: {item.channel.toUpperCase()}</p>
            </div>
            <span className="confidence">{Math.round(item.confidence * 100)}%</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
