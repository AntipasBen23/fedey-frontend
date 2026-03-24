import { DashboardShell } from "@/components/dashboard-shell";
import {
  createExperiment,
  getExperiments,
  getStrategySnapshot,
  recordAnalyticsEvent
} from "@/lib/api/client";
import { revalidatePath } from "next/cache";

export default async function HomePage() {
  const [snapshot, experiments] = await Promise.all([
    getStrategySnapshot(),
    getExperiments()
  ]);

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
      snapshot={snapshot}
      experiments={experiments}
      onCreateExperiment={handleCreateExperiment}
      onRecordAnalyticsEvent={handleRecordAnalyticsEvent}
    />
  );
}
