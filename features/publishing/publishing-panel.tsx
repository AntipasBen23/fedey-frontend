import type { ContentDraft } from "@/lib/contracts/content";
import type { PublishingSchedule } from "@/lib/contracts/publishing";

type PublishingPanelProps = {
  drafts: ContentDraft[];
  schedules: PublishingSchedule[];
  onCreateSchedule: (formData: FormData) => Promise<void>;
  onMarkPublished: (formData: FormData) => Promise<void>;
  onSyncPerformance: () => Promise<void>;
};

export function PublishingPanel({
  drafts,
  schedules,
  onCreateSchedule,
  onMarkPublished,
  onSyncPerformance
}: PublishingPanelProps) {
  return (
    <section className="card publishing-card">
      <header className="section-header">
        <h2>Publishing Queue</h2>
        <p>Schedule a draft or variant for a channel, keep spacing healthy, and sync live engagement back into experiments.</p>
      </header>
      <form action={onSyncPerformance}>
        <button type="submit" className="publish-button sync-button">
          Sync Live Performance
        </button>
      </form>
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
          Queue Profile
          <select name="queueProfile" defaultValue="standard">
            <option value="standard">Standard</option>
            <option value="new">New Account</option>
            <option value="existing">Existing Account</option>
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
              <p className="publish-meta">Queue profile: {schedule.queueProfile}</p>
              {schedule.platformPostId ? (
                <p className="publish-meta">Platform post ID: {schedule.platformPostId}</p>
              ) : null}
              {schedule.performanceSyncedAt ? (
                <p className="publish-meta">
                  Performance synced at {new Date(schedule.performanceSyncedAt).toLocaleString()}
                </p>
              ) : null}
              {schedule.timeline && schedule.timeline.length > 0 ? (
                <div className="summary-block">
                  <p className="summary-title">Engagement Timeline</p>
                  {schedule.timeline.map((point) => (
                    <p key={`${schedule.id}-${point.capturedAt}`} className="publish-meta">
                      {new Date(point.capturedAt).toLocaleString()} | total {point.totalEngagement} | likes {point.likes} | replies {point.replies}
                      {schedule.channel === "linkedin" ? ` | comments ${point.comments}` : ` | quotes ${point.quotes}`}
                    </p>
                  ))}
                </div>
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
