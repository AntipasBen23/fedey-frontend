import type { ContentDraft } from "@/lib/contracts/content";
import type { PublishingSchedule } from "@/lib/contracts/publishing";

type PublishingPanelProps = {
  drafts: ContentDraft[];
  schedules: PublishingSchedule[];
  onCreateSchedule: (formData: FormData) => Promise<void>;
  onMarkPublished: (formData: FormData) => Promise<void>;
};

export function PublishingPanel({
  drafts,
  schedules,
  onCreateSchedule,
  onMarkPublished
}: PublishingPanelProps) {
  return (
    <section className="card publishing-card">
      <header className="section-header">
        <h2>Publishing Queue</h2>
        <p>Schedule a draft or variant for a channel and track whether it has gone live.</p>
      </header>
      <form className="publishing-form" action={onCreateSchedule}>
        <label>
          Draft
          <select name="draftId" required defaultValue="">
            <option value="" disabled>
              Select draft
            </option>
            {drafts.map((draft) => (
              <option key={draft.id} value={draft.id}>
                {draft.channel.toUpperCase()} | {draft.sourceTrend}
              </option>
            ))}
          </select>
        </label>
        <label>
          Variant Label
          <input type="text" name="variantLabel" placeholder="A, B, C or leave blank" />
        </label>
        <label>
          Publish Channel
          <select name="channel" required defaultValue="x">
            <option value="x">X</option>
            <option value="linkedin">LinkedIn</option>
          </select>
        </label>
        <label>
          Scheduled Time
          <input type="datetime-local" name="scheduledFor" required />
        </label>
        <button type="submit">Schedule Publish</button>
      </form>
      <ul className="stack-list">
        {schedules.map((schedule) => (
          <li key={schedule.id} className="list-item">
            <div className="publish-copy">
              <p className="item-title">
                {schedule.channel.toUpperCase()} | {schedule.draftId}
                {schedule.variantLabel ? ` | Variant ${schedule.variantLabel}` : ""}
              </p>
              <p className="item-subtitle">
                Scheduled for {new Date(schedule.scheduledFor).toLocaleString()}
              </p>
              {schedule.platformPostId ? (
                <p className="publish-meta">Platform post ID: {schedule.platformPostId}</p>
              ) : null}
              {schedule.status === "published" && schedule.publishedAt ? (
                <p className="publish-meta">
                  Published at {new Date(schedule.publishedAt).toLocaleString()}
                </p>
              ) : (
                <form action={onMarkPublished}>
                  <input type="hidden" name="scheduleId" value={schedule.id} />
                  <button type="submit" className="publish-button">
                    Mark Published
                  </button>
                </form>
              )}
            </div>
            <span className={`status status-${schedule.status}`}>{schedule.status}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
