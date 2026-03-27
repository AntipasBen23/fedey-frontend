import type { OnboardingSession } from "@/lib/contracts/onboarding";

type OnboardingPanelProps = {
  sessions: OnboardingSession[];
  onCreateSession: (formData: FormData) => Promise<void>;
  onAnswerQuestion: (formData: FormData) => Promise<void>;
  onUpdateReviewMode: (formData: FormData) => Promise<void>;
  onRunAudit: (formData: FormData) => Promise<void>;
  onActivate: (formData: FormData) => Promise<void>;
  onUpdateActivationPlan: (formData: FormData) => Promise<void>;
  onUpdateActivationDrafts: (formData: FormData) => Promise<void>;
  onApprove: (formData: FormData) => Promise<void>;
};

export function OnboardingPanel({
  sessions,
  onCreateSession,
  onAnswerQuestion,
  onUpdateReviewMode,
  onRunAudit,
  onActivate,
  onUpdateActivationPlan,
  onUpdateActivationDrafts,
  onApprove
}: OnboardingPanelProps) {
  function renderActivationCalendar(session: OnboardingSession) {
    const scheduledDrafts = session.activation.drafts
      .filter((draft) => draft.scheduledFor)
      .sort((left, right) => new Date(left.scheduledFor ?? "").getTime() - new Date(right.scheduledFor ?? "").getTime());

    if (scheduledDrafts.length === 0) {
      return null;
    }

    return (
      <div className="onboarding-block">
        <p className="item-subtitle">Week-One Calendar</p>
        <div className="calendar-grid">
          {scheduledDrafts.map((draft) => {
            const scheduledAt = new Date(draft.scheduledFor ?? "");
            const dayLabel = scheduledAt.toLocaleDateString(undefined, {
              weekday: "short",
              month: "short",
              day: "numeric"
            });

            return (
              <div key={`${session.id}-${draft.draftId}-calendar`} className="calendar-card">
                <p className="calendar-day">{dayLabel}</p>
                <p className="calendar-time">
                  {scheduledAt.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit"
                  })}
                </p>
                <p className="calendar-channel">{draft.channel.toUpperCase()}</p>
                <p className="calendar-hook">{draft.hook}</p>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <section className="card onboarding-card">
      <header className="section-header">
        <h2>Hiring Workspace</h2>
        <p>Give the agent a role description, let it ask smart questions, and audit existing accounts before activation.</p>
      </header>

      <form className="onboarding-form" action={onCreateSession}>
        <label>
          Role Title
          <input type="text" name="title" placeholder="Founder social media manager" />
        </label>
        <label>
          Account Mode
          <select name="accountMode" defaultValue="new">
            <option value="new">New account</option>
            <option value="existing">Existing account</option>
          </select>
        </label>
        <label>
          Brand Name
          <input type="text" name="brandName" placeholder="Fedey" />
        </label>
        <label>
          Primary Platform
          <select name="primaryPlatform" defaultValue="x">
            <option value="x">X</option>
            <option value="linkedin">LinkedIn</option>
            <option value="instagram">Instagram</option>
          </select>
        </label>
        <label>
          Objective
          <input type="text" name="objective" placeholder="Build authority and generate leads" />
        </label>
        <label>
          Audience
          <input type="text" name="audience" placeholder="Founders and growth teams" />
        </label>
        <label>
          Constraints
          <input type="text" name="constraints" placeholder="No hype, no fake urgency, no rude replies" />
        </label>
        <label>
          Review Mode
          <select name="reviewMode" defaultValue="auto">
            <option value="auto">Auto activate</option>
            <option value="manual">Review before activation</option>
          </select>
        </label>
        <label>
          Job Description
          <textarea
            name="jobDescription"
            rows={6}
            placeholder="Describe what this social media manager should achieve, how they should sound, and what success looks like."
            required
          />
        </label>
        <button type="submit">Hire Agent</button>
      </form>

      <ul className="stack-list">
        {sessions.map((session) => (
          <li key={session.id} className="list-item onboarding-item">
            <div className="onboarding-copy">
              <p className="item-title">
                {session.title} | {session.accountMode.toUpperCase()} | {session.primaryPlatform.toUpperCase()}
              </p>
              <p className="item-subtitle">{session.objective}</p>
              <p className="onboarding-meta">Voice: {session.voiceSummary}</p>
              <p className="onboarding-meta">Status: {session.status}</p>
              <p className="onboarding-meta">
                Review mode: {session.reviewMode} | Approval: {session.approvalStatus}
              </p>
              <p className="onboarding-meta">{session.jobDescription}</p>

              <form className="onboarding-answer-form" action={onUpdateReviewMode}>
                <input type="hidden" name="sessionId" value={session.id} />
                <label>
                  Change review mode
                  <select name="reviewMode" defaultValue={session.reviewMode}>
                    <option value="auto">Auto activate</option>
                    <option value="manual">Review before activation</option>
                  </select>
                </label>
                <button type="submit">Update Review Mode</button>
              </form>

              {session.questions.length > 0 ? (
                <div className="onboarding-block">
                  <p className="item-subtitle">Follow-up Questions</p>
                  {session.questions.map((question) => (
                    <form key={question.id} className="onboarding-answer-form" action={onAnswerQuestion}>
                      <input type="hidden" name="sessionId" value={session.id} />
                      <input type="hidden" name="questionId" value={question.id} />
                      <label>
                        {question.prompt}
                        <input
                          type="text"
                          name="answer"
                          defaultValue={question.answer ?? ""}
                          placeholder="Type answer here"
                        />
                      </label>
                      <button type="submit">{question.answer ? "Update Answer" : "Save Answer"}</button>
                    </form>
                  ))}
                </div>
              ) : null}

              {session.accountMode === "existing" ? (
                <form action={onRunAudit}>
                  <input type="hidden" name="sessionId" value={session.id} />
                  <button type="submit" className="community-button">
                    Run Existing Account Audit
                  </button>
                </form>
              ) : null}

              <div className="onboarding-block">
                <p className="item-subtitle">Audit Report</p>
                <p className="onboarding-meta">
                  Audit status: {session.audit.status} | Posts reviewed: {session.audit.postsReviewed}
                </p>
                {session.audit.connectedPlatforms.length > 0 ? (
                  <p className="onboarding-meta">
                    Connected platforms: {session.audit.connectedPlatforms.join(", ")}
                  </p>
                ) : null}
                {session.audit.contentPatterns.map((item) => (
                  <p key={item} className="onboarding-meta">{item}</p>
                ))}
                {session.audit.replyPatterns.map((item) => (
                  <p key={item} className="onboarding-meta">{item}</p>
                ))}
                {session.audit.recommendations.map((item) => (
                  <p key={item} className="reply-draft">{item}</p>
                ))}
                {session.audit.performanceInsights.map((item) => (
                  <p key={item} className="reply-draft">{item}</p>
                ))}
              </div>

              <div className="onboarding-block">
                <p className="item-subtitle">Activation Plan</p>
                <p className="onboarding-meta">
                  Status: {session.activation.status || "not_started"} | Brand memory sync:{" "}
                  {session.activation.brandMemorySync ? "yes" : "no"}
                </p>
                {session.activation.summary ? (
                  <p className="reply-draft">{session.activation.summary}</p>
                ) : null}
                {session.activation.weekPlan.length > 0 ? (
                  session.reviewMode === "manual" && session.approvalStatus !== "approved" ? (
                    <form className="onboarding-answer-form" action={onUpdateActivationPlan}>
                      <input type="hidden" name="sessionId" value={session.id} />
                      <input type="hidden" name="itemCount" value={String(session.activation.weekPlan.length)} />
                      {session.activation.weekPlan.map((item, index) => (
                        <div key={`${session.id}-${item.day}-${item.channel}`} className="onboarding-block">
                          <input type="hidden" name={`day-${index}`} value={item.day} />
                          <label>
                            Channel
                            <select name={`channel-${index}`} defaultValue={item.channel}>
                              <option value="x">X</option>
                              <option value="linkedin">LinkedIn</option>
                            </select>
                          </label>
                          <label>
                            Focus
                            <input type="text" name={`focus-${index}`} defaultValue={item.focus} />
                          </label>
                          <label>
                            Format
                            <input type="text" name={`format-${index}`} defaultValue={item.format} />
                          </label>
                          <label>
                            Hypothesis
                            <input type="text" name={`hypothesis-${index}`} defaultValue={item.hypothesis} />
                          </label>
                        </div>
                      ))}
                      <button type="submit" className="community-button secondary">
                        Save Week-One Plan
                      </button>
                    </form>
                  ) : (
                    session.activation.weekPlan.map((item) => (
                      <p key={`${session.id}-${item.day}-${item.channel}`} className="onboarding-meta">
                        {item.day} | {item.channel.toUpperCase()} | {item.focus} | {item.format}
                      </p>
                    ))
                  )
                ) : null}
                {session.activation.drafts.map((draft) => (
                  session.reviewMode === "manual" && session.approvalStatus !== "approved" ? null : (
                    <p key={draft.draftId} className="reply-draft">
                      Draft {draft.channel.toUpperCase()} | {draft.hook}
                      {draft.scheduledFor ? ` | Scheduled ${new Date(draft.scheduledFor).toLocaleString()}` : ""}
                    </p>
                  )
                ))}
                {session.activation.drafts.length > 0 && session.reviewMode === "manual" && session.approvalStatus !== "approved" ? (
                  <form className="onboarding-answer-form" action={onUpdateActivationDrafts}>
                    <input type="hidden" name="sessionId" value={session.id} />
                    <input type="hidden" name="draftCount" value={String(session.activation.drafts.length)} />
                    {session.activation.drafts.map((draft, index) => (
                      <div key={`${session.id}-${draft.draftId}`} className="onboarding-block">
                        <input type="hidden" name={`draftId-${index}`} value={draft.draftId} />
                        <label>
                          Draft Channel
                          <select name={`draftChannel-${index}`} defaultValue={draft.channel}>
                            <option value="x">X</option>
                            <option value="linkedin">LinkedIn</option>
                          </select>
                        </label>
                        <label>
                          Hook
                          <input type="text" name={`draftHook-${index}`} defaultValue={draft.hook} />
                        </label>
                        <label>
                          Body
                          <textarea name={`draftBody-${index}`} rows={5} defaultValue={draft.body} />
                        </label>
                        <label>
                          Rationale
                          <input type="text" name={`draftRationale-${index}`} defaultValue={draft.rationale} />
                        </label>
                      </div>
                    ))}
                    <button type="submit" className="community-button secondary">
                      Save Activation Drafts
                    </button>
                  </form>
                ) : null}
                <form action={onActivate}>
                  <input type="hidden" name="sessionId" value={session.id} />
                  <button type="submit" className="community-button secondary">
                    {session.reviewMode === "manual" ? "Generate Plan and Drafts" : "Activate Agent"}
                  </button>
                </form>
                {session.approvalStatus === "pending" ? (
                  <form action={onApprove}>
                    <input type="hidden" name="sessionId" value={session.id} />
                    <button type="submit" className="community-button">
                      Approve and Schedule Week One
                    </button>
                  </form>
                ) : null}
                {renderActivationCalendar(session)}
                {session.history.length > 0 ? (
                  <div className="onboarding-block">
                    <p className="item-subtitle">Approval and Audit History</p>
                    {session.history.map((entry) => (
                      <p key={entry.id} className="onboarding-meta">
                        {new Date(entry.createdAt).toLocaleString()} | {entry.actor} | {entry.description}
                      </p>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
            <span className={`status status-${session.status}`}>{session.status}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
