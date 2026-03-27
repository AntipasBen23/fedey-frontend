import type { OnboardingSession } from "@/lib/contracts/onboarding";

type OnboardingPanelProps = {
  sessions: OnboardingSession[];
  onCreateSession: (formData: FormData) => Promise<void>;
  onAnswerQuestion: (formData: FormData) => Promise<void>;
  onRunAudit: (formData: FormData) => Promise<void>;
  onActivate: (formData: FormData) => Promise<void>;
};

export function OnboardingPanel({
  sessions,
  onCreateSession,
  onAnswerQuestion,
  onRunAudit,
  onActivate
}: OnboardingPanelProps) {
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
              <p className="onboarding-meta">{session.jobDescription}</p>

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
                {session.activation.weekPlan.map((item) => (
                  <p key={`${session.id}-${item.day}-${item.channel}`} className="onboarding-meta">
                    {item.day} | {item.channel.toUpperCase()} | {item.focus} | {item.format}
                  </p>
                ))}
                <form action={onActivate}>
                  <input type="hidden" name="sessionId" value={session.id} />
                  <button type="submit" className="community-button secondary">
                    Activate Agent
                  </button>
                </form>
              </div>
            </div>
            <span className={`status status-${session.status}`}>{session.status}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
