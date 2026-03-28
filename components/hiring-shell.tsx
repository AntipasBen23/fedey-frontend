import type { LinkedInConnectionStatus, XConnectionStatus } from "@/lib/contracts/integrations";
import type { OnboardingSession } from "@/lib/contracts/onboarding";

type HiringShellProps = {
  xConnectionStatus: XConnectionStatus;
  linkedinConnectionStatus: LinkedInConnectionStatus;
  xConnectUrl: string;
  linkedinConnectUrl: string;
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

export function HiringShell({
  xConnectionStatus,
  linkedinConnectionStatus,
  xConnectUrl,
  linkedinConnectUrl,
  sessions,
  onCreateSession,
  onAnswerQuestion,
  onUpdateReviewMode,
  onRunAudit,
  onActivate,
  onUpdateActivationPlan,
  onUpdateActivationDrafts,
  onApprove
}: HiringShellProps) {
  const latestSession = sessions[0];

  return (
    <main className="landing-page">
      <section className="landing-hero">
        <div className="landing-copy">
          <p className="badge">Hire an AI Social Media Manager</p>
          <h1>Describe the job. Connect the accounts. Let the agent take it from there.</h1>
          <p>
            Fedey should feel like hiring a social media manager, not operating a complicated tool.
            Start with the role description, connect X or LinkedIn, answer the agent&apos;s questions,
            and review the first-week plan only if you want to.
          </p>
        </div>
        <div className="landing-summary">
          <p className="landing-summary-title">How it works</p>
          <p className="landing-summary-item">1. Paste the job description and goals.</p>
          <p className="landing-summary-item">2. Connect X, LinkedIn, or both.</p>
          <p className="landing-summary-item">3. Answer only the questions the agent still needs.</p>
          <p className="landing-summary-item">4. Approve the plan or let the agent run automatically.</p>
        </div>
      </section>

      <section className="landing-grid">
        <section className="card landing-card">
          <header className="section-header">
            <h2>1. Hire The Agent</h2>
            <p>Give the AI a real job description and the business context it needs.</p>
          </header>
          <form className="onboarding-form" action={onCreateSession}>
            <label>
              Role Title
              <input type="text" name="title" placeholder="Founder social media manager" />
            </label>
            <label>
              Job Description
              <textarea
                name="jobDescription"
                rows={7}
                placeholder="Act as our social media manager. Learn our style, grow authority, reply well, and improve our content week by week."
                required
              />
            </label>
            <label>
              Account Type
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
              Main Goal
              <input type="text" name="objective" placeholder="Build authority and generate leads" />
            </label>
            <label>
              Audience
              <input type="text" name="audience" placeholder="Founders and growth teams" />
            </label>
            <label>
              Primary Platform
              <select name="primaryPlatform" defaultValue="x">
                <option value="x">X</option>
                <option value="linkedin">LinkedIn</option>
              </select>
            </label>
            <label>
              Hard Constraints
              <input type="text" name="constraints" placeholder="No hype, no fake urgency, no rude replies" />
            </label>
            <label>
              Review Preference
              <select name="reviewMode" defaultValue="manual">
                <option value="manual">I want to review first</option>
                <option value="auto">The agent can run automatically</option>
              </select>
            </label>
            <button type="submit">Start Onboarding</button>
          </form>
        </section>

        <section className="card landing-card">
          <header className="section-header">
            <h2>2. Connect Accounts</h2>
            <p>The agent learns faster from the real account history, tone, replies, and performance.</p>
          </header>
          <div className="connect-stack">
            <div className="connect-card">
              <p className="item-title">X</p>
              <p className="item-subtitle">
                {xConnectionStatus.connected
                  ? `Connected as @${xConnectionStatus.account?.username ?? "account"}`
                  : "Connect an X account so the agent can study previous posts and publish for you."}
              </p>
              <a className="integration-link" href={xConnectUrl}>
                {xConnectionStatus.connected ? "Reconnect X" : "Connect X"}
              </a>
            </div>
            <div className="connect-card">
              <p className="item-title">LinkedIn</p>
              <p className="item-subtitle">
                {linkedinConnectionStatus.connected
                  ? `Connected as ${linkedinConnectionStatus.account?.displayName ?? "account"}`
                  : "Connect LinkedIn so the agent can learn your post style and professional tone."}
              </p>
              <a className="integration-link" href={linkedinConnectUrl}>
                {linkedinConnectionStatus.connected ? "Reconnect LinkedIn" : "Connect LinkedIn"}
              </a>
            </div>
          </div>
        </section>
      </section>

      {latestSession ? (
        <section className="landing-journey">
          <header className="section-header">
            <h2>3. Current Onboarding</h2>
            <p>The agent should ask for only what it still needs, then move into plan review and execution.</p>
          </header>

          <div className="journey-grid">
            <section className="card landing-card">
              <p className="item-title">{latestSession.title}</p>
              <p className="item-subtitle">
                {latestSession.accountMode.toUpperCase()} account | {latestSession.primaryPlatform.toUpperCase()} first
              </p>
              <p className="onboarding-meta">Status: {latestSession.status}</p>
              <p className="onboarding-meta">
                Review mode: {latestSession.reviewMode} | Approval: {latestSession.approvalStatus}
              </p>
              <form className="onboarding-answer-form" action={onUpdateReviewMode}>
                <input type="hidden" name="sessionId" value={latestSession.id} />
                <label>
                  Review Preference
                  <select name="reviewMode" defaultValue={latestSession.reviewMode}>
                    <option value="manual">I want to review first</option>
                    <option value="auto">The agent can run automatically</option>
                  </select>
                </label>
                <button type="submit">Update Preference</button>
              </form>
              {latestSession.accountMode === "existing" ? (
                <form action={onRunAudit}>
                  <input type="hidden" name="sessionId" value={latestSession.id} />
                  <button type="submit" className="community-button">
                    Audit Connected Accounts
                  </button>
                </form>
              ) : null}
              <a className="landing-ops-link" href="/ops">
                Open advanced workspace
              </a>
            </section>

            <section className="card landing-card">
              <p className="item-title">Questions From The Agent</p>
              <p className="item-subtitle">Answer these and the agent can tighten the plan.</p>
              {latestSession.questions.length > 0 ? (
                latestSession.questions.map((question) => (
                  <form key={question.id} className="onboarding-answer-form" action={onAnswerQuestion}>
                    <input type="hidden" name="sessionId" value={latestSession.id} />
                    <input type="hidden" name="questionId" value={question.id} />
                    <label>
                      {question.prompt}
                      <input
                        type="text"
                        name="answer"
                        defaultValue={question.answer ?? ""}
                        placeholder="Answer here"
                      />
                    </label>
                    <button type="submit">{question.answer ? "Update Answer" : "Save Answer"}</button>
                  </form>
                ))
              ) : (
                <p className="onboarding-meta">The agent has no more questions right now.</p>
              )}
            </section>

            <section className="card landing-card landing-card-wide">
              <p className="item-title">Review And Activation</p>
              {latestSession.activation.summary ? (
                <p className="reply-draft">{latestSession.activation.summary}</p>
              ) : (
                <p className="onboarding-meta">Generate the first-week plan when you are ready.</p>
              )}

              {latestSession.activation.weekPlan.length > 0 ? (
                <div className="landing-plan-list">
                  {latestSession.activation.weekPlan.map((item, index) => (
                    <div key={`${latestSession.id}-${item.day}-${index}`} className="landing-plan-item">
                      <p className="item-title">
                        {item.day} · {item.channel.toUpperCase()}
                      </p>
                      <p className="item-subtitle">{item.focus}</p>
                      <p className="onboarding-meta">{item.format}</p>
                    </div>
                  ))}
                </div>
              ) : null}

              {latestSession.reviewMode === "manual" &&
              latestSession.activation.weekPlan.length > 0 &&
              latestSession.approvalStatus !== "approved" ? (
                <form className="onboarding-answer-form" action={onUpdateActivationPlan}>
                  <input type="hidden" name="sessionId" value={latestSession.id} />
                  <input type="hidden" name="itemCount" value={String(latestSession.activation.weekPlan.length)} />
                  {latestSession.activation.weekPlan.map((item, index) => (
                    <div key={`${latestSession.id}-plan-edit-${index}`} className="onboarding-block">
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
                    Save Plan Changes
                  </button>
                </form>
              ) : null}

              {latestSession.reviewMode === "manual" &&
              latestSession.activation.drafts.length > 0 &&
              latestSession.approvalStatus !== "approved" ? (
                <form className="onboarding-answer-form" action={onUpdateActivationDrafts}>
                  <input type="hidden" name="sessionId" value={latestSession.id} />
                  <input type="hidden" name="draftCount" value={String(latestSession.activation.drafts.length)} />
                  {latestSession.activation.drafts.map((draft, index) => (
                    <div key={`${latestSession.id}-${draft.draftId}`} className="onboarding-block">
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
                        <textarea name={`draftBody-${index}`} rows={4} defaultValue={draft.body} />
                      </label>
                      <label>
                        Rationale
                        <input type="text" name={`draftRationale-${index}`} defaultValue={draft.rationale} />
                      </label>
                    </div>
                  ))}
                  <button type="submit" className="community-button secondary">
                    Save Draft Changes
                  </button>
                </form>
              ) : null}

              <div className="landing-action-row">
                <form action={onActivate}>
                  <input type="hidden" name="sessionId" value={latestSession.id} />
                  <button type="submit" className="community-button secondary">
                    {latestSession.reviewMode === "manual" ? "Generate Or Refresh Plan" : "Let The Agent Start"}
                  </button>
                </form>
                {latestSession.approvalStatus === "pending" ? (
                  <form action={onApprove}>
                    <input type="hidden" name="sessionId" value={latestSession.id} />
                    <button type="submit" className="community-button">
                      Approve And Start
                    </button>
                  </form>
                ) : null}
              </div>

              {latestSession.activation.drafts.some((draft) => draft.scheduledFor) ? (
                <div className="calendar-grid">
                  {latestSession.activation.drafts
                    .filter((draft) => draft.scheduledFor)
                    .sort((left, right) => new Date(left.scheduledFor ?? "").getTime() - new Date(right.scheduledFor ?? "").getTime())
                    .map((draft) => {
                      const scheduledAt = new Date(draft.scheduledFor ?? "");
                      return (
                        <div key={`${latestSession.id}-${draft.draftId}-calendar`} className="calendar-card">
                          <p className="calendar-day">
                            {scheduledAt.toLocaleDateString(undefined, {
                              weekday: "short",
                              month: "short",
                              day: "numeric"
                            })}
                          </p>
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
              ) : null}
            </section>
          </div>
        </section>
      ) : null}
    </main>
  );
}
