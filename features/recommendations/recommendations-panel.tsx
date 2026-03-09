import type { StrategyRecommendation } from "@/lib/contracts/strategy";

type RecommendationsPanelProps = {
  recommendations: StrategyRecommendation[];
};

export function RecommendationsPanel({
  recommendations
}: RecommendationsPanelProps) {
  return (
    <section className="card">
      <header className="section-header">
        <h2>Strategy Updates</h2>
        <p>Cross-account learning signals translated into account-level actions.</p>
      </header>
      <ul className="stack-list">
        {recommendations.map((item) => (
          <li key={item.id} className="list-item">
            <div>
              <p className="item-title">{item.title}</p>
              <p className="item-subtitle">{item.detail}</p>
            </div>
            <span className="impact">{item.impactScore}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
