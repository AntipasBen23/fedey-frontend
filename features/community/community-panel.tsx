import type { CommunityItem } from "@/lib/contracts/community";

type CommunityPanelProps = {
  items: CommunityItem[];
  onCreateInboxItem: (formData: FormData) => Promise<void>;
  onDraftReply: (formData: FormData) => Promise<void>;
  onMarkReplied: (formData: FormData) => Promise<void>;
};

export function CommunityPanel({
  items,
  onCreateInboxItem,
  onDraftReply,
  onMarkReplied
}: CommunityPanelProps) {
  return (
    <section className="card community-card">
      <header className="section-header">
        <h2>Community Inbox</h2>
        <p>Audience replies the agent can triage, draft, and mark as handled.</p>
      </header>
      <form className="community-form" action={onCreateInboxItem}>
        <label>
          Platform
          <input type="text" name="platform" placeholder="x" required />
        </label>
        <label>
          Author
          <input type="text" name="author" placeholder="founder_ops" required />
        </label>
        <label>
          Message
          <textarea name="message" rows={3} placeholder="Comment or reply text" required />
        </label>
        <label>
          Sentiment
          <input type="text" name="sentiment" placeholder="positive" />
        </label>
        <label>
          Linked Post Ref
          <input type="text" name="linkedPostRef" placeholder="sch-1" required />
        </label>
        <button type="submit">Add Inbox Item</button>
      </form>
      <ul className="stack-list">
        {items.map((item) => (
          <li key={item.id} className="list-item">
            <div className="community-copy">
              <p className="item-title">
                {item.platform.toUpperCase()} | @{item.author}
              </p>
              <p className="item-subtitle">{item.message}</p>
              <p className="community-meta">
                Sentiment: {item.sentiment} | Linked post: {item.linkedPostRef}
              </p>
              {item.replyDraft ? (
                <p className="reply-draft">{item.replyDraft}</p>
              ) : (
                <form action={onDraftReply}>
                  <input type="hidden" name="itemId" value={item.id} />
                  <button type="submit" className="community-button">
                    Draft Reply
                  </button>
                </form>
              )}
              {item.status !== "replied" ? (
                <form action={onMarkReplied}>
                  <input type="hidden" name="itemId" value={item.id} />
                  <button type="submit" className="community-button secondary">
                    Mark Replied
                  </button>
                </form>
              ) : null}
            </div>
            <span className={`status status-${item.status}`}>{item.status}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
