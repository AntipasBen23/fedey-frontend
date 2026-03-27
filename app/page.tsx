import { DashboardShell } from "@/components/dashboard-shell";
import {
  createCommunityInboxItem,
  createOnboardingSession,
  createExperiment,
  createPublishingSchedule,
  answerOnboardingQuestion,
  activateOnboardingSession,
  approveOnboardingSession,
  updateOnboardingActivationDrafts,
  updateOnboardingActivationPlan,
  generateContentDrafts,
  generateDraftVariants,
  getAutomationSettings,
  getAutomationRuns,
  getBrandMemory,
  getLinkedInConnectionStatus,
  getXConnectionStatus,
  getCommunityInbox,
  getContentDrafts,
  getExperiments,
  getOnboardingSessions,
  getPublishingSchedules,
  getStrategySnapshot,
  getTrends,
  ingestLiveTrends,
  runAutomationNow,
  syncLinkedInCommunityInbox,
  syncXCommunityInbox,
  draftCommunityReply,
  markCommunityReplySent,
  markPublishingSchedulePublished,
  syncPublishingPerformance,
  recordAnalyticsEvent,
  runOnboardingAudit,
  createTrend,
  updateOnboardingReviewMode,
  updateBrandMemory
} from "@/lib/api/client";
import { revalidatePath } from "next/cache";

export default async function HomePage() {
  const apiBaseUrl = process.env.FEDEY_API_URL ?? "http://localhost:8080";
  const [xConnectionStatus, linkedinConnectionStatus, onboardingSessions, brandMemory, trends, drafts, schedules, communityItems, automationRuns, automationSettings, snapshot, experiments] = await Promise.all([
    getXConnectionStatus(),
    getLinkedInConnectionStatus(),
    getOnboardingSessions(),
    getBrandMemory(),
    getTrends(),
    getContentDrafts(),
    getPublishingSchedules(),
    getCommunityInbox(),
    getAutomationRuns(),
    getAutomationSettings(),
    getStrategySnapshot(),
    getExperiments()
  ]);

  async function handleSaveBrandMemory(formData: FormData) {
    "use server";

    const brandName = String(formData.get("brandName") ?? "").trim();
    const tone = String(formData.get("tone") ?? "").trim();
    const audience = String(formData.get("audience") ?? "").trim();
    const pillars = String(formData.get("pillars") ?? "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
    const guardrails = String(formData.get("guardrails") ?? "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    if (!brandName || !tone || !audience) {
      return;
    }

    await updateBrandMemory({
      brandName,
      tone,
      audience,
      pillars,
      guardrails
    });
    revalidatePath("/");
  }

  async function handleCreateOnboardingSession(formData: FormData) {
    "use server";

    const title = String(formData.get("title") ?? "").trim();
    const accountMode = String(formData.get("accountMode") ?? "").trim();
    const brandName = String(formData.get("brandName") ?? "").trim();
    const primaryPlatform = String(formData.get("primaryPlatform") ?? "").trim();
    const objective = String(formData.get("objective") ?? "").trim();
    const audience = String(formData.get("audience") ?? "").trim();
    const reviewMode = String(formData.get("reviewMode") ?? "").trim();
    const constraints = String(formData.get("constraints") ?? "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
    const jobDescription = String(formData.get("jobDescription") ?? "").trim();
    if (!jobDescription || !accountMode) {
      return;
    }

    await createOnboardingSession({
      title,
      accountMode,
      brandName,
      primaryPlatform,
      objective,
      audience,
      constraints,
      reviewMode,
      jobDescription
    });
    revalidatePath("/");
  }

  async function handleAnswerOnboardingQuestion(formData: FormData) {
    "use server";

    const sessionId = String(formData.get("sessionId") ?? "").trim();
    const questionId = String(formData.get("questionId") ?? "").trim();
    const answer = String(formData.get("answer") ?? "").trim();
    if (!sessionId || !questionId || !answer) {
      return;
    }

    await answerOnboardingQuestion({
      sessionId,
      questionId,
      answer
    });
    revalidatePath("/");
  }

  async function handleRunOnboardingAudit(formData: FormData) {
    "use server";

    const sessionId = String(formData.get("sessionId") ?? "").trim();
    if (!sessionId) {
      return;
    }

    await runOnboardingAudit(sessionId);
    revalidatePath("/");
  }

  async function handleUpdateOnboardingReviewMode(formData: FormData) {
    "use server";

    const sessionId = String(formData.get("sessionId") ?? "").trim();
    const reviewMode = String(formData.get("reviewMode") ?? "").trim();
    if (!sessionId || !reviewMode) {
      return;
    }

    await updateOnboardingReviewMode({
      sessionId,
      reviewMode
    });
    revalidatePath("/");
  }

  async function handleActivateOnboardingSession(formData: FormData) {
    "use server";

    const sessionId = String(formData.get("sessionId") ?? "").trim();
    if (!sessionId) {
      return;
    }

    await activateOnboardingSession(sessionId);
    revalidatePath("/");
  }

  async function handleUpdateOnboardingActivationPlan(formData: FormData) {
    "use server";

    const sessionId = String(formData.get("sessionId") ?? "").trim();
    const itemCount = Number(String(formData.get("itemCount") ?? "0").trim());
    if (!sessionId || Number.isNaN(itemCount) || itemCount <= 0) {
      return;
    }

    const weekPlan = Array.from({ length: itemCount }, (_, index) => ({
      day: String(formData.get(`day-${index}`) ?? "").trim(),
      channel: String(formData.get(`channel-${index}`) ?? "").trim(),
      focus: String(formData.get(`focus-${index}`) ?? "").trim(),
      format: String(formData.get(`format-${index}`) ?? "").trim(),
      hypothesis: String(formData.get(`hypothesis-${index}`) ?? "").trim()
    })).filter((item) => item.day && item.channel && item.focus && item.format && item.hypothesis);

    if (weekPlan.length === 0) {
      return;
    }

    await updateOnboardingActivationPlan({
      sessionId,
      weekPlan
    });
    revalidatePath("/");
  }

  async function handleUpdateOnboardingActivationDrafts(formData: FormData) {
    "use server";

    const sessionId = String(formData.get("sessionId") ?? "").trim();
    const draftCount = Number(String(formData.get("draftCount") ?? "0").trim());
    if (!sessionId || Number.isNaN(draftCount) || draftCount <= 0) {
      return;
    }

    const drafts = Array.from({ length: draftCount }, (_, index) => ({
      draftId: String(formData.get(`draftId-${index}`) ?? "").trim(),
      channel: String(formData.get(`draftChannel-${index}`) ?? "").trim(),
      hook: String(formData.get(`draftHook-${index}`) ?? "").trim(),
      body: String(formData.get(`draftBody-${index}`) ?? "").trim(),
      rationale: String(formData.get(`draftRationale-${index}`) ?? "").trim()
    })).filter((item) => item.draftId && item.hook && item.body);

    if (drafts.length === 0) {
      return;
    }

    await updateOnboardingActivationDrafts({
      sessionId,
      drafts
    });
    revalidatePath("/");
  }

  async function handleApproveOnboardingSession(formData: FormData) {
    "use server";

    const sessionId = String(formData.get("sessionId") ?? "").trim();
    if (!sessionId) {
      return;
    }

    await approveOnboardingSession(sessionId);
    revalidatePath("/");
  }

  async function handleCreateExperiment(formData: FormData) {
    "use server";

    const hypothesisId = String(formData.get("hypothesisId") ?? "").trim();
    const metric = String(formData.get("metric") ?? "").trim();
    if (!hypothesisId || !metric) {
      return;
    }

    await createExperiment({
      hypothesisId,
      metric
    });
    revalidatePath("/");
  }

  async function handleCreateTrend(formData: FormData) {
    "use server";

    const topic = String(formData.get("topic") ?? "").trim();
    const source = String(formData.get("source") ?? "").trim();
    const angle = String(formData.get("angle") ?? "").trim();
    const velocity = Number(String(formData.get("velocity") ?? "").trim());
    const relevance = Number(String(formData.get("relevance") ?? "").trim());
    if (!topic || !source || !angle || Number.isNaN(velocity) || Number.isNaN(relevance)) {
      return;
    }

    await createTrend({
      topic,
      source,
      angle,
      velocity,
      relevance
    });
    revalidatePath("/");
  }

  async function handleIngestLiveTrends(formData: FormData) {
    "use server";

    const source = String(formData.get("source") ?? "").trim();
    const query = String(formData.get("query") ?? "").trim();
    const subreddit = String(formData.get("subreddit") ?? "").trim();
    const limit = Number(String(formData.get("limit") ?? "").trim() || "5");
    if (!source || Number.isNaN(limit)) {
      return;
    }

    await ingestLiveTrends({
      source,
      query,
      subreddit,
      limit
    });
    revalidatePath("/");
  }

  async function handleRecordAnalyticsEvent(formData: FormData) {
    "use server";

    const experimentId = String(formData.get("experimentId") ?? "").trim();
    const variant = String(formData.get("variant") ?? "").trim();
    const rawValue = String(formData.get("value") ?? "").trim();
    const value = Number(rawValue);
    if (!experimentId || !variant || Number.isNaN(value) || value < 0) {
      return;
    }

    await recordAnalyticsEvent({
      experimentId,
      variant,
      value
    });
    revalidatePath("/");
  }

  async function handleGenerateDrafts() {
    "use server";

    await generateContentDrafts();
    revalidatePath("/");
  }

  async function handleGenerateVariants(formData: FormData) {
    "use server";

    const draftId = String(formData.get("draftId") ?? "").trim();
    if (!draftId) {
      return;
    }

    await generateDraftVariants(draftId);
    revalidatePath("/");
  }

  async function handleCreateSchedule(formData: FormData) {
    "use server";

    const draftId = String(formData.get("draftId") ?? "").trim();
    const variantLabel = String(formData.get("variantLabel") ?? "").trim();
    const channel = String(formData.get("channel") ?? "").trim();
    const queueProfile = String(formData.get("queueProfile") ?? "").trim();
    const scheduledValue = String(formData.get("scheduledFor") ?? "").trim();
    if (!draftId || !channel || !scheduledValue) {
      return;
    }

    const scheduledFor = new Date(scheduledValue);
    if (Number.isNaN(scheduledFor.getTime())) {
      return;
    }

    await createPublishingSchedule({
      draftId,
      variantLabel,
      channel,
      queueProfile,
      scheduledFor: scheduledFor.toISOString()
    });
    revalidatePath("/");
  }

  async function handleMarkPublished(formData: FormData) {
    "use server";

    const scheduleId = String(formData.get("scheduleId") ?? "").trim();
    if (!scheduleId) {
      return;
    }

    await markPublishingSchedulePublished(scheduleId);
    revalidatePath("/");
  }

  async function handleSyncPublishingPerformance() {
    "use server";

    await syncPublishingPerformance();
    revalidatePath("/");
  }

  async function handleCreateInboxItem(formData: FormData) {
    "use server";

    const platform = String(formData.get("platform") ?? "").trim();
    const author = String(formData.get("author") ?? "").trim();
    const message = String(formData.get("message") ?? "").trim();
    const sentiment = String(formData.get("sentiment") ?? "").trim();
    const linkedPostRef = String(formData.get("linkedPostRef") ?? "").trim();
    if (!platform || !author || !message || !linkedPostRef) {
      return;
    }

    await createCommunityInboxItem({
      platform,
      author,
      message,
      sentiment,
      linkedPostRef
    });
    revalidatePath("/");
  }

  async function handleSyncXMentions() {
    "use server";

    await syncXCommunityInbox();
    revalidatePath("/");
  }

  async function handleSyncLinkedInComments() {
    "use server";

    await syncLinkedInCommunityInbox();
    revalidatePath("/");
  }

  async function handleDraftReply(formData: FormData) {
    "use server";

    const itemId = String(formData.get("itemId") ?? "").trim();
    if (!itemId) {
      return;
    }

    await draftCommunityReply(itemId);
    revalidatePath("/");
  }

  async function handleMarkReplied(formData: FormData) {
    "use server";

    const itemId = String(formData.get("itemId") ?? "").trim();
    if (!itemId) {
      return;
    }

    await markCommunityReplySent(itemId);
    revalidatePath("/");
  }

  async function handleRunAutomationNow() {
    "use server";

    await runAutomationNow();
    revalidatePath("/");
  }

  return (
    <DashboardShell
      xConnectionStatus={xConnectionStatus}
      linkedinConnectionStatus={linkedinConnectionStatus}
      xConnectUrl={`${apiBaseUrl}/v1/integrations/x/connect`}
      linkedinConnectUrl={`${apiBaseUrl}/v1/integrations/linkedin/connect`}
      onboardingSessions={onboardingSessions}
      brandMemory={brandMemory}
      trends={trends}
      drafts={drafts}
      schedules={schedules}
      communityItems={communityItems}
      automationRuns={automationRuns}
      automationSettings={automationSettings}
      snapshot={snapshot}
      experiments={experiments}
      onSaveBrandMemory={handleSaveBrandMemory}
      onCreateOnboardingSession={handleCreateOnboardingSession}
      onAnswerOnboardingQuestion={handleAnswerOnboardingQuestion}
      onUpdateOnboardingReviewMode={handleUpdateOnboardingReviewMode}
      onRunOnboardingAudit={handleRunOnboardingAudit}
      onActivateOnboardingSession={handleActivateOnboardingSession}
      onUpdateOnboardingActivationPlan={handleUpdateOnboardingActivationPlan}
      onUpdateOnboardingActivationDrafts={handleUpdateOnboardingActivationDrafts}
      onApproveOnboardingSession={handleApproveOnboardingSession}
      onCreateTrend={handleCreateTrend}
      onIngestLiveTrends={handleIngestLiveTrends}
      onGenerateDrafts={handleGenerateDrafts}
      onGenerateVariants={handleGenerateVariants}
      onCreateSchedule={handleCreateSchedule}
      onMarkPublished={handleMarkPublished}
      onSyncPublishingPerformance={handleSyncPublishingPerformance}
      onCreateInboxItem={handleCreateInboxItem}
      onSyncXMentions={handleSyncXMentions}
      onSyncLinkedInComments={handleSyncLinkedInComments}
      onDraftReply={handleDraftReply}
      onMarkReplied={handleMarkReplied}
      onRunAutomationNow={handleRunAutomationNow}
      onCreateExperiment={handleCreateExperiment}
      onRecordAnalyticsEvent={handleRecordAnalyticsEvent}
    />
  );
}
