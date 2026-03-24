import { DashboardShell } from "@/components/dashboard-shell";
import {
  createExperiment,
  generateContentDrafts,
  generateDraftVariants,
  getBrandMemory,
  getContentDrafts,
  getExperiments,
  getStrategySnapshot,
  getTrends,
  recordAnalyticsEvent,
  createTrend,
  updateBrandMemory
} from "@/lib/api/client";
import { revalidatePath } from "next/cache";

export default async function HomePage() {
  const [brandMemory, trends, drafts, snapshot, experiments] = await Promise.all([
    getBrandMemory(),
    getTrends(),
    getContentDrafts(),
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

  return (
    <DashboardShell
      brandMemory={brandMemory}
      trends={trends}
      drafts={drafts}
      snapshot={snapshot}
      experiments={experiments}
      onSaveBrandMemory={handleSaveBrandMemory}
      onCreateTrend={handleCreateTrend}
      onGenerateDrafts={handleGenerateDrafts}
      onGenerateVariants={handleGenerateVariants}
      onCreateExperiment={handleCreateExperiment}
      onRecordAnalyticsEvent={handleRecordAnalyticsEvent}
    />
  );
}
