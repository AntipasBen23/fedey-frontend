import { DashboardShell } from "@/components/dashboard-shell";
import {
  createExperiment,
  getBrandMemory,
  getExperiments,
  getStrategySnapshot,
  recordAnalyticsEvent,
  updateBrandMemory
} from "@/lib/api/client";
import { revalidatePath } from "next/cache";

export default async function HomePage() {
  const [brandMemory, snapshot, experiments] = await Promise.all([
    getBrandMemory(),
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

  return (
    <DashboardShell
      brandMemory={brandMemory}
      snapshot={snapshot}
      experiments={experiments}
      onSaveBrandMemory={handleSaveBrandMemory}
      onCreateExperiment={handleCreateExperiment}
      onRecordAnalyticsEvent={handleRecordAnalyticsEvent}
    />
  );
}
