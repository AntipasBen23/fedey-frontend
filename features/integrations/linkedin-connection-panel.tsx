import type { LinkedInConnectionStatus } from "@/lib/contracts/integrations";

type LinkedInConnectionPanelProps = {
  status: LinkedInConnectionStatus;
  connectUrl: string;
};

export function LinkedInConnectionPanel({ status, connectUrl }: LinkedInConnectionPanelProps) {
  return (
    <section className="card integration-card">
      <header className="section-header">
        <h2>LinkedIn Connection</h2>
        <p>Connect a real LinkedIn account so the agent can publish live professional posts.</p>
      </header>
      {status.connected && status.account ? (
        <div className="integration-copy">
          <p className="item-title">{status.account.displayName}</p>
          <p className="item-subtitle">Member ID: {status.account.memberId}</p>
          <p className="integration-meta">Author URN: {status.account.authorUrn}</p>
          <p className="integration-meta">
            Connected at {new Date(status.account.connectedAt).toLocaleString()}
          </p>
          <p className="integration-meta">Scopes: {status.account.scopes.join(", ")}</p>
        </div>
      ) : (
        <div className="integration-copy">
          <p className="item-subtitle">No LinkedIn account connected yet.</p>
          <a className="integration-link" href={connectUrl}>
            Connect LinkedIn Account
          </a>
        </div>
      )}
    </section>
  );
}
