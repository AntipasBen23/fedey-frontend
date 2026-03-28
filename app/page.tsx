import { HiringShell } from "@/components/hiring-shell";
import {
  createOnboardingSession,
  answerOnboardingQuestion,
  activateOnboardingSession,
  approveOnboardingSession,
  updateOnboardingActivationDrafts,
  updateOnboardingActivationPlan,
  getLinkedInConnectionStatus,
  getXConnectionStatus,
  getOnboardingSessions,
  runOnboardingAudit,
  updateOnboardingReviewMode
} from "@/lib/api/client";
import { revalidatePath } from "next/cache";

export default async function HomePage() {
  const apiBaseUrl = process.env.FEDEY_API_URL ?? "http://localhost:8080";
  const [xConnectionStatus, linkedinConnectionStatus, onboardingSessions] = await Promise.all([
    getXConnectionStatus(),
    getLinkedInConnectionStatus(),
    getOnboardingSessions()
  ]);

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
    revalidatePath("/ops");
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
    revalidatePath("/ops");
  }

  async function handleRunOnboardingAudit(formData: FormData) {
    "use server";

    const sessionId = String(formData.get("sessionId") ?? "").trim();
    if (!sessionId) {
      return;
    }

    await runOnboardingAudit(sessionId);
    revalidatePath("/");
    revalidatePath("/ops");
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
    revalidatePath("/ops");
  }

  async function handleActivateOnboardingSession(formData: FormData) {
    "use server";

    const sessionId = String(formData.get("sessionId") ?? "").trim();
    if (!sessionId) {
      return;
    }

    await activateOnboardingSession(sessionId);
    revalidatePath("/");
    revalidatePath("/ops");
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
    revalidatePath("/ops");
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
    revalidatePath("/ops");
  }

  async function handleApproveOnboardingSession(formData: FormData) {
    "use server";

    const sessionId = String(formData.get("sessionId") ?? "").trim();
    if (!sessionId) {
      return;
    }

    await approveOnboardingSession(sessionId);
    revalidatePath("/");
    revalidatePath("/ops");
  }

  return (
    <HiringShell
      xConnectionStatus={xConnectionStatus}
      linkedinConnectionStatus={linkedinConnectionStatus}
      xConnectUrl={`${apiBaseUrl}/v1/integrations/x/connect`}
      linkedinConnectUrl={`${apiBaseUrl}/v1/integrations/linkedin/connect`}
      sessions={onboardingSessions}
      onCreateSession={handleCreateOnboardingSession}
      onAnswerQuestion={handleAnswerOnboardingQuestion}
      onUpdateReviewMode={handleUpdateOnboardingReviewMode}
      onRunAudit={handleRunOnboardingAudit}
      onActivate={handleActivateOnboardingSession}
      onUpdateActivationPlan={handleUpdateOnboardingActivationPlan}
      onUpdateActivationDrafts={handleUpdateOnboardingActivationDrafts}
      onApprove={handleApproveOnboardingSession}
    />
  );
}
