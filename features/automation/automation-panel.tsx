import type { AutomationRun, AutomationSettings } from "@/lib/contracts/automation";

type AutomationPanelProps = {
  runs: AutomationRun[];
  settings: AutomationSettings;
  onRunNow: () => Promise<void>;
};

export function AutomationPanel({ runs, settings, onRunNow }: AutomationPanelProps) {
  return (
    <section className="card automation-card">
      <header className="section-header">
        <h2>Automation Worker</h2>
        <p>Run the agent loop now and inspect how timed windows drive scheduling and publishing.</p>
      </header>
      <p className="automation-meta">
        Interval {settings.interval} | Windows{" "}
        {settings.windows.length > 0 ? settings.windows.map((window) => window.label).join(", ") : "Not set"}
      </p>
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
                Published {run.postsPublished} | Signals {run.signalsIngested} | Drafts {run.draftsGenerated} |
                Schedules {run.schedulesCreated} | Mentions {run.mentionsSynced} | Replies {run.repliesDrafted}
              </p>
            </div>
            <span className={`status status-${run.status}`}>{run.status}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
