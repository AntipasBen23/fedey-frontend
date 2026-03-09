import { DashboardShell } from "@/components/dashboard-shell";
import { getStrategySnapshot } from "@/lib/api/client";

export default async function HomePage() {
  const snapshot = await getStrategySnapshot();
  return <DashboardShell snapshot={snapshot} />;
}
