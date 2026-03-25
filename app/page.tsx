import { DashboardShell } from "@/components/dashboard-shell";
import {
  createExperiment,
  createPublishingSchedule,
  generateContentDrafts,
  generateDraftVariants,
  getBrandMemory,
  getContentDrafts,
  getExperiments,
  getPublishingSchedules,
  getStrategySnapshot,
  getTrends,
  markPublishingSchedulePublished,
  recordAnalyticsEvent,
  createTrend,
  updateBrandMemory
} from "@/lib/api/client";
import { revalidatePath } from "next/cache";

export default async function HomePage() {
  const [brandMemory, trends, drafts, schedules, snapshot, experiments] = await Promise.all([
    getBrandMemory(),
    getTrends(),
    getContentDrafts(),
    getPublishingSchedules(),
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

  return (
    <DashboardShell
      brandMemory={brandMemory}
      trends={trends}
      drafts={drafts}
      schedules={schedules}
      snapshot={snapshot}
      experiments={experiments}
      onSaveBrandMemory={handleSaveBrandMemory}
      onCreateTrend={handleCreateTrend}
      onGenerateDrafts={handleGenerateDrafts}
      onGenerateVariants={handleGenerateVariants}
      onCreateSchedule={handleCreateSchedule}
      onMarkPublished={handleMarkPublished}
      onCreateExperiment={handleCreateExperiment}
      onRecordAnalyticsEvent={handleRecordAnalyticsEvent}
    />
  );
}
