import type { XConnectionStatus } from "@/lib/contracts/integrations";

type XConnectionPanelProps = {
  status: XConnectionStatus;
  connectUrl: string;
};

export function XConnectionPanel({ status, connectUrl }: XConnectionPanelProps) {
  return (
    <section className="card integration-card">
      <header className="section-header">
        <h2>X Connection</h2>
        <p>Connect a real X account so the agent can publish posts and ingest mentions live.</p>
      </header>
      {status.connected && status.account ? (
        <div className="integration-copy">
          <p className="item-title">@{status.account.username}</p>
          <p className="item-subtitle">User ID: {status.account.userId}</p>
          <p className="integration-meta">
            Connected at {new Date(status.account.connectedAt).toLocaleString()}
          </p>
          <p className="integration-meta">
            Scopes: {status.account.scopes.join(", ")}
          </p>
        </div>
      ) : (
        <div className="integration-copy">
          <p className="item-subtitle">No X account connected yet.</p>
          <a className="integration-link" href={connectUrl}>
            Connect X Account
          </a>
        </div>
      )}
    </section>
  );
}
