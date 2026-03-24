import type { ContentDraft } from "@/lib/contracts/content";

type ContentPanelProps = {
  drafts: ContentDraft[];
  onGenerateDrafts: () => Promise<void>;
  onGenerateVariants: (formData: FormData) => Promise<void>;
};

export function ContentPanel({
  drafts,
  onGenerateDrafts,
  onGenerateVariants
}: ContentPanelProps) {
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
              {draft.experimentId ? (
                <p className="draft-link">Linked experiment: {draft.experimentId}</p>
              ) : null}
              {draft.variants && draft.variants.length > 0 ? (
                <ul className="variant-list">
                  {draft.variants.map((variant) => (
                    <li key={`${draft.id}-${variant.label}`}>
                      {variant.label}: {variant.angle}
                    </li>
                  ))}
                </ul>
              ) : (
                <form action={onGenerateVariants}>
                  <input type="hidden" name="draftId" value={draft.id} />
                  <button type="submit" className="variant-button">
                    Generate Variants
                  </button>
                </form>
              )}
            </div>
            <span className="status">{draft.status}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
