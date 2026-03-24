import type { ContentDraft } from "@/lib/contracts/content";

type ContentPanelProps = {
  drafts: ContentDraft[];
  onGenerateDrafts: () => Promise<void>;
};

export function ContentPanel({ drafts, onGenerateDrafts }: ContentPanelProps) {
  return (
    <section className="card content-card">
      <header className="section-header">
        <h2>Content Engine</h2>
        <p>Drafts generated from current brand memory and observed trend signals.</p>
      </header>
      <form action={onGenerateDrafts}>
        <button type="submit" className="content-button">
          Generate Drafts
        </button>
      </form>
      <ul className="stack-list">
        {drafts.map((draft) => (
          <li key={draft.id} className="list-item">
            <div className="draft-copy">
              <p className="item-title">
                {draft.channel.toUpperCase()} | {draft.sourceTrend}
              </p>
              <p className="item-subtitle">{draft.hook}</p>
              <p className="draft-body">{draft.body}</p>
              <p className="draft-rationale">{draft.rationale}</p>
            </div>
            <span className="status">{draft.status}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
