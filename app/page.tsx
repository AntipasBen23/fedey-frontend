import { DashboardShell } from "@/components/dashboard-shell";
import {
  createCommunityInboxItem,
  createExperiment,
  createPublishingSchedule,
  generateContentDrafts,
  generateDraftVariants,
  getAutomationRuns,
  getBrandMemory,
  getXConnectionStatus,
  getCommunityInbox,
  getContentDrafts,
  getExperiments,
  getPublishingSchedules,
  getStrategySnapshot,
  getTrends,
  runAutomationNow,
  syncXCommunityInbox,
  draftCommunityReply,
  markCommunityReplySent,
  markPublishingSchedulePublished,
  recordAnalyticsEvent,
  createTrend,
  updateBrandMemory
} from "@/lib/api/client";
import { revalidatePath } from "next/cache";

export default async function HomePage() {
  const apiBaseUrl = process.env.FEDEY_API_URL ?? "http://localhost:8080";
  const [xConnectionStatus, brandMemory, trends, drafts, schedules, communityItems, automationRuns, snapshot, experiments] = await Promise.all([
    getXConnectionStatus(),
    getBrandMemory(),
    getTrends(),
    getContentDrafts(),
    getPublishingSchedules(),
    getCommunityInbox(),
    getAutomationRuns(),
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
      xConnectUrl={`${apiBaseUrl}/v1/integrations/x/connect`}
      brandMemory={brandMemory}
      trends={trends}
      drafts={drafts}
      schedules={schedules}
      communityItems={communityItems}
      automationRuns={automationRuns}
      snapshot={snapshot}
      experiments={experiments}
      onSaveBrandMemory={handleSaveBrandMemory}
      onCreateTrend={handleCreateTrend}
      onGenerateDrafts={handleGenerateDrafts}
      onGenerateVariants={handleGenerateVariants}
      onCreateSchedule={handleCreateSchedule}
      onMarkPublished={handleMarkPublished}
      onCreateInboxItem={handleCreateInboxItem}
      onSyncXMentions={handleSyncXMentions}
      onDraftReply={handleDraftReply}
      onMarkReplied={handleMarkReplied}
      onRunAutomationNow={handleRunAutomationNow}
      onCreateExperiment={handleCreateExperiment}
      onRecordAnalyticsEvent={handleRecordAnalyticsEvent}
    />
  );
}
