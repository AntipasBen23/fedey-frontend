import { DashboardShell } from "@/components/dashboard-shell";
import { createExperiment, getExperiments, getStrategySnapshot } from "@/lib/api/client";
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

  return (
    <DashboardShell
      snapshot={snapshot}
      experiments={experiments}
      onCreateExperiment={handleCreateExperiment}
    />
  );
}
