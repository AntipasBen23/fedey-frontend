import type { AutomationRun } from "@/lib/contracts/automation";

type AutomationPanelProps = {
  runs: AutomationRun[];
  onRunNow: () => Promise<void>;
};

export function AutomationPanel({ runs, onRunNow }: AutomationPanelProps) {
  return (
    <section className="card automation-card">
      <header className="section-header">
        <h2>Automation Worker</h2>
        <p>Run the agent loop now and inspect what each automation pass completed.</p>
      </header>
      <form action={onRunNow}>
        <button type="submit" className="automation-button">
          Run Automation Now
        </button>
      </form>
      <ul className="stack-list">
        {runs.map((run) => (
          <li key={run.id} className="list-item">
            <div className="automation-copy">
              <p className="item-title">
                {run.triggeredBy} | {new Date(run.createdAt).toLocaleString()}
              </p>
              <p className="item-subtitle">{run.notes}</p>
              <p className="automation-meta">
                Drafts {run.draftsGenerated} | Schedules {run.schedulesCreated} | Replies{" "}
                {run.repliesDrafted}
              </p>
            </div>
            <span className={`status status-${run.status}`}>{run.status}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
