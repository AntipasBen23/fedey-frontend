import type { CommunityItem } from "@/lib/contracts/community";
import type { LinkedInConnectionStatus, XConnectionStatus } from "@/lib/contracts/integrations";
import type { OnboardingQuestion, OnboardingSession } from "@/lib/contracts/onboarding";
import type { PublishingSchedule } from "@/lib/contracts/publishing";

type HiringShellProps = {
  xConnectionStatus: XConnectionStatus;
  linkedinConnectionStatus: LinkedInConnectionStatus;
  xConnectUrl: string;
  linkedinConnectUrl: string;
  sessions: OnboardingSession[];
  schedules: PublishingSchedule[];
  communityItems: CommunityItem[];
  onCreateSession: (formData: FormData) => Promise<void>;
  onAnswerQuestion: (formData: FormData) => Promise<void>;
  onUpdateReviewMode: (formData: FormData) => Promise<void>;
  onRunAudit: (formData: FormData) => Promise<void>;
  onActivate: (formData: FormData) => Promise<void>;
  onUpdateActivationPlan: (formData: FormData) => Promise<void>;
  onUpdateActivationDrafts: (formData: FormData) => Promise<void>;
  onApprove: (formData: FormData) => Promise<void>;
};

type StepState = "complete" | "current" | "upcoming";

type LiveStatus = {
  nextPost?: PublishingSchedule;
  connectedAccounts: string[];
  repliesWaiting: number;
  weeklyGrowthSummary: string;
};

export function HiringShell({
  xConnectionStatus,
  linkedinConnectionStatus,
  xConnectUrl,
  linkedinConnectUrl,
  sessions,
  schedules,
  communityItems,
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
  const activeStep = getActiveStep(latestSession, xConnectionStatus.connected, linkedinConnectionStatus.connected);
  const liveStatus = getLiveStatus({
    xConnectionStatus,
    linkedinConnectionStatus,
    schedules,
    communityItems
  });
  const showLiveHome = isSessionLive(latestSession);
  const pendingQuestion = latestSession ? latestSession.questions.find((question) => !question.answer) : undefined;

  return (
    <main className="landing-page">
      <section className="landing-hero">
        <div className="landing-copy">
          <p className="badge">Hire an AI Social Media Manager</p>
          <h1>Describe the role and let the agent take over from there.</h1>
          <p>
            This should feel like hiring a smart teammate. Give the job description, connect X or LinkedIn,
            answer the agent&apos;s questions, and decide whether you want to review the plan or let it run.
          </p>
        </div>
        <div className="landing-summary">
          <p className="landing-summary-title">Guided flow</p>
          <p className="landing-summary-item">1. Describe the job and goals.</p>
          <p className="landing-summary-item">2. Connect the accounts you want the agent to manage.</p>
          <p className="landing-summary-item">3. Chat with the agent only about what it still needs.</p>
          <p className="landing-summary-item">4. Review the launch plan or let the agent start automatically.</p>
        </div>
      </section>

      {showLiveHome ? (
        <section className="live-home">
          <header className="section-header">
            <h2>Agent Live Status</h2>
            <p>The agent is onboarded. Here is the simple operating view you should care about day to day.</p>
          </header>
          <div className="live-status-grid">
            <div className="status-card">
              <p className="status-card-label">Next post</p>
              {liveStatus.nextPost ? (
                <>
                  <p className="status-card-value">{liveStatus.nextPost.channel.toUpperCase()}</p>
                  <p className="status-card-meta">{formatSchedule(liveStatus.nextPost.scheduledFor)}</p>
                </>
              ) : (
                <>
                  <p className="status-card-value">No post queued</p>
                  <p className="status-card-meta">The agent will schedule the next slot after the next planning run.</p>
                </>
              )}
            </div>
            <div className="status-card">
              <p className="status-card-label">Connected accounts</p>
              <p className="status-card-value">{liveStatus.connectedAccounts.length}</p>
              <p className="status-card-meta">
                {liveStatus.connectedAccounts.length > 0
                  ? liveStatus.connectedAccounts.join(" and ")
                  : "No connected accounts yet"}
              </p>
            </div>
            <div className="status-card">
              <p className="status-card-label">Replies waiting</p>
              <p className="status-card-value">{String(liveStatus.repliesWaiting)}</p>
              <p className="status-card-meta">Comments and mentions waiting on the agent reply loop.</p>
            </div>
            <div className="status-card">
              <p className="status-card-label">Weekly growth summary</p>
              <p className="status-card-value">This week</p>
              <p className="status-card-meta">{liveStatus.weeklyGrowthSummary}</p>
            </div>
          </div>
        </section>
      ) : null}

      <section className="stepper-card">
        <div className="stepper-row">
          <StepChip index={1} title="Describe role" state={getStepState(activeStep, 1)} />
          <StepChip index={2} title="Connect accounts" state={getStepState(activeStep, 2)} />
          <StepChip index={3} title="Agent interview" state={getStepState(activeStep, 3)} />
          <StepChip index={4} title="Review and launch" state={getStepState(activeStep, 4)} />
        </div>
      </section>

      {activeStep === 1 ? (
        <section className="landing-focus">
          <section className="card landing-card focus-card">
            <header className="section-header">
              <h2>Step 1. Describe the role</h2>
              <p>Start the same way you would brief a real social media hire.</p>
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
                  rows={8}
                  placeholder="Act as our social media manager. Learn our style, grow authority on X and LinkedIn, reply well, and improve results every week."
                  required
                />
              </label>
              <div className="inline-field-grid">
                <label>
                  Account Type
                  <select name="accountMode" defaultValue="new">
                    <option value="new">New account</option>
                    <option value="existing">Existing account</option>
                  </select>
                </label>
                <label>
                  Primary Platform
                  <select name="primaryPlatform" defaultValue="x">
                    <option value="x">X</option>
                    <option value="linkedin">LinkedIn</option>
                  </select>
                </label>
              </div>
              <div className="inline-field-grid">
                <label>
                  Brand Name
                  <input type="text" name="brandName" placeholder="Fedey" />
                </label>
                <label>
                  Main Goal
                  <input type="text" name="objective" placeholder="Build authority and generate leads" />
                </label>
              </div>
              <label>
                Audience
                <input type="text" name="audience" placeholder="Founders, operators, and growth teams" />
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
              <button type="submit">Start onboarding</button>
            </form>
          </section>
        </section>
      ) : null}

      {latestSession ? (
        <>
          {activeStep === 2 ? (
            <section className="landing-focus">
              <section className="card landing-card focus-card">
                <header className="section-header">
                  <h2>Step 2. Connect the accounts</h2>
                  <p>
                    The more real history the agent can inspect, the better it can mirror tone, posting style,
                    and reply behavior.
                  </p>
                </header>
                <div className="connect-stack">
                  <div className="connect-card">
                    <p className="item-title">X</p>
                    <p className="item-subtitle">
                      {xConnectionStatus.connected
                        ? `Connected as @${xConnectionStatus.account?.username ?? "account"}`
                        : "Connect X so the agent can study historical posts and publish on your behalf."}
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
                        : "Connect LinkedIn so the agent can learn your professional content style and audience."}
                    </p>
                    <a className="integration-link" href={linkedinConnectUrl}>
                      {linkedinConnectionStatus.connected ? "Reconnect LinkedIn" : "Connect LinkedIn"}
                    </a>
                  </div>
                </div>
              </section>
            </section>
          ) : null}

          {activeStep === 3 ? (
            <section className="landing-focus">
              <section className="card landing-card focus-card">
                <header className="section-header">
                  <h2>Step 3. Chat with the agent</h2>
                  <p>
                    Yes, this can feel more like GPT or Claude. Right now we&apos;re shaping the UX into a real
                    chat-style interview, while the backend still uses the onboarding question system underneath.
                  </p>
                </header>

                <div className="chat-shell">
                  <div className="chat-thread">
                    <ChatMessage
                      role="agent"
                      title="Fedey agent"
                      body={`I’ve read the role description for ${latestSession.brandName || latestSession.title}. I’m collecting only the details I still need before I start planning.`}
                    />
                    <ChatMessage
                      role="agent"
                      title="What I already know"
                      body={`${latestSession.objective || "Your main objective is still being clarified"}. Primary platform: ${latestSession.primaryPlatform.toUpperCase()}. Review mode: ${latestSession.reviewMode}.`}
                    />
                    {latestSession.questions
                      .filter((question) => question.answer)
                      .map((question) => (
                        <AnsweredQuestion key={question.id} question={question} />
                      ))}
                    {pendingQuestion ? (
                      <>
                        <ChatMessage role="agent" title="Next question" body={pendingQuestion.prompt} />
                        <form className="chat-composer" action={onAnswerQuestion}>
                          <input type="hidden" name="sessionId" value={latestSession.id} />
                          <input type="hidden" name="questionId" value={pendingQuestion.id} />
                          <input
                            type="text"
                            name="answer"
                            placeholder="Type your answer to the agent"
                            autoComplete="off"
                          />
                          <button type="submit">Send</button>
                        </form>
                      </>
                    ) : (
                      <div className="chat-done">
                        <p className="item-title">The agent has what it needs for now.</p>
                        <p className="item-subtitle">
                          If this is an existing account, run the audit so it can learn from previous posts and replies.
                        </p>
                      </div>
                    )}
                  </div>

                  <aside className="chat-sidebar">
                    <div className="chat-sidebar-card">
                      <p className="item-title">Onboarding snapshot</p>
                      <p className="item-subtitle">
                        {latestSession.accountMode.toUpperCase()} account for {latestSession.primaryPlatform.toUpperCase()} first
                      </p>
                      <p className="onboarding-meta">Review mode: {latestSession.reviewMode}</p>
                    </div>
                    <form className="onboarding-answer-form" action={onUpdateReviewMode}>
                      <input type="hidden" name="sessionId" value={latestSession.id} />
                      <label>
                        Review preference
                        <select name="reviewMode" defaultValue={latestSession.reviewMode}>
                          <option value="manual">I want to review first</option>
                          <option value="auto">The agent can run automatically</option>
                        </select>
                      </label>
                      <button type="submit">Save preference</button>
                    </form>
                    {latestSession.accountMode === "existing" ? (
                      <form action={onRunAudit}>
                        <input type="hidden" name="sessionId" value={latestSession.id} />
                        <button type="submit" className="community-button">
                          Audit connected accounts
                        </button>
                      </form>
                    ) : null}
                  </aside>
                </div>
              </section>
            </section>
          ) : null}

          {activeStep === 4 ? (
            <section className="landing-focus">
              <section className="card landing-card focus-card">
                <header className="section-header">
                  <h2>Step 4. Review and launch</h2>
                  <p>
                    You can keep this hands-off or review the week-one plan before the agent starts. That choice stays
                    yours at any time.
                  </p>
                </header>

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
                      Save plan changes
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
                      Save draft changes
                    </button>
                  </form>
                ) : null}

                <div className="landing-action-row">
                  <form action={onActivate}>
                    <input type="hidden" name="sessionId" value={latestSession.id} />
                    <button type="submit" className="community-button secondary">
                      {latestSession.reviewMode === "manual" ? "Generate or refresh plan" : "Let the agent start"}
                    </button>
                  </form>
                  {latestSession.approvalStatus === "pending" ? (
                    <form action={onApprove}>
                      <input type="hidden" name="sessionId" value={latestSession.id} />
                      <button type="submit" className="community-button">
                        Approve and start
                      </button>
                    </form>
                  ) : null}
                </div>

                {latestSession.activation.drafts.some((draft) => draft.scheduledFor) ? (
                  <div className="calendar-grid">
                    {latestSession.activation.drafts
                      .filter((draft) => draft.scheduledFor)
                      .sort(
                        (left, right) =>
                          new Date(left.scheduledFor ?? "").getTime() - new Date(right.scheduledFor ?? "").getTime()
                      )
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
            </section>
          ) : null}

          <section className="landing-footer-note">
            <a className="landing-ops-link" href="/ops">
              Open advanced workspace
            </a>
          </section>
        </>
      ) : null}
    </main>
  );
}

function StepChip({ index, title, state }: { index: number; title: string; state: StepState }) {
  return (
    <div className={`step-chip step-chip-${state}`}>
      <span className="step-chip-index">{index}</span>
      <span>{title}</span>
    </div>
  );
}

function ChatMessage({ role, title, body }: { role: "agent" | "user"; title: string; body: string }) {
  return (
    <div className={`chat-message chat-message-${role}`}>
      <p className="chat-title">{title}</p>
      <p className="chat-body">{body}</p>
    </div>
  );
}

function AnsweredQuestion({ question }: { question: OnboardingQuestion }) {
  return (
    <>
      <ChatMessage role="agent" title="Fedey agent" body={question.prompt} />
      <ChatMessage role="user" title="You" body={question.answer ?? ""} />
    </>
  );
}

function getActiveStep(
  session: OnboardingSession | undefined,
  xConnected: boolean,
  linkedinConnected: boolean
): number {
  if (!session) {
    return 1;
  }

  if (!xConnected && !linkedinConnected) {
    return 2;
  }

  if (session.questions.some((question) => !question.answer)) {
    return 3;
  }

  return 4;
}

function getStepState(activeStep: number, step: number): StepState {
  if (step < activeStep) {
    return "complete";
  }

  if (step === activeStep) {
    return "current";
  }

  return "upcoming";
}

function isSessionLive(session: OnboardingSession | undefined): boolean {
  if (!session) {
    return false;
  }

  return (
    session.approvalStatus === "approved" ||
    session.activation.drafts.some((draft) => draft.scheduleStatus === "scheduled" || draft.scheduleStatus === "published")
  );
}

function getLiveStatus(input: {
  xConnectionStatus: XConnectionStatus;
  linkedinConnectionStatus: LinkedInConnectionStatus;
  schedules: PublishingSchedule[];
  communityItems: CommunityItem[];
}): LiveStatus {
  const now = Date.now();
  const nextPost = [...input.schedules]
    .filter((schedule) => new Date(schedule.scheduledFor).getTime() >= now)
    .sort((left, right) => new Date(left.scheduledFor).getTime() - new Date(right.scheduledFor).getTime())[0];

  const connectedAccounts = [
    input.xConnectionStatus.connected ? "X" : null,
    input.linkedinConnectionStatus.connected ? "LinkedIn" : null
  ].filter(Boolean) as string[];

  const repliesWaiting = input.communityItems.filter((item) => item.status !== "replied").length;
  const weeklyGrowthSummary = summarizeWeeklyGrowth(input.schedules);

  return {
    nextPost,
    connectedAccounts,
    repliesWaiting,
    weeklyGrowthSummary
  };
}

function summarizeWeeklyGrowth(schedules: PublishingSchedule[]): string {
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const recentPublished = schedules.filter((schedule) => {
    if (!schedule.publishedAt) {
      return false;
    }

    return new Date(schedule.publishedAt).getTime() >= weekAgo;
  });

  if (recentPublished.length === 0) {
    return "No published posts yet this week. The first performance summary will appear after the first live posts land.";
  }

  const totalEngagement = recentPublished.reduce((sum, schedule) => {
    const latestPoint = schedule.timeline?.[schedule.timeline.length - 1];
    return sum + (latestPoint?.totalEngagement ?? 0);
  }, 0);

  const syncedPosts = recentPublished.filter((schedule) => (schedule.timeline?.length ?? 0) > 0).length;
  return `${recentPublished.length} published posts, ${syncedPosts} with live engagement tracking, ${totalEngagement} total engagements captured so far.`;
}

function formatSchedule(value: string): string {
  const scheduledAt = new Date(value);
  return scheduledAt.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}
