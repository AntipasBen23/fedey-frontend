"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import TrendingWidget from "@/components/TrendingWidget";
import ReactionModal from "@/components/ReactionModal";
import EditPostModal from "@/components/EditPostModal";
import { MoreVertical, Edit2, Clock, Trash2 } from "lucide-react";
import FurciChat from "@/components/FurciChat";
import FollowerGrowthChart from "@/components/FollowerGrowthChart";
import CustomPostModal from "@/components/CustomPostModal";
import EngagementFeed from "@/components/EngagementFeed";

type PostPerformance = {
  postId: number;
  snippet: string;
  platform: string;
  contentType: string;
  likes: number;
  reposts: number;
  comments: number;
  impressions: number;
  engRate: number;
  postedAt: string;
};

type FollowerPoint = { date: string; count: number };

type AnalyticsOverview = {
  followerCount: number;
  followerGrowth: number;
  followerHistory: FollowerPoint[];
  totalImpressions: number;
  totalReactions: number;
  avgEngRate: number;
  postsAnalyzed: number;
  topPosts: PostPerformance[];
  lastSynced: string;
  insight: string;
};

type DashboardData = {
  calendar: any[];
  history: any[];
  socialAccounts: any[];
  strategy: {
    identityAudit: string;
    trendMonitoring: string;
    growthExperiments: string;
    analyticsReporting: string;
  };
  stats: {
    totalPosts: number;
    activeExperiments: number;
    impactScore: string;
  };
  plan: "free" | "pro";
  analytics: AnalyticsOverview;
};

export default function DashboardPage() {
  const router = useRouter();
  const { data: session } = useSession() as any;
  const { isLoggedIn, ready, user } = useAuth() as any;

  // Auth guard — redirect to home if not logged in
  useEffect(() => {
    if (ready && !isLoggedIn) {
      router.replace("/");
    }
  }, [ready, isLoggedIn, router]);
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [autopilot, setAutopilot] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  // Trend Reaction State
  const [selectedTrend, setSelectedTrend] = useState("");
  const [trendReaction, setTrendReaction] = useState("");
  const [loadingReaction, setLoadingReaction] = useState(false);
  const [showReactionModal, setShowReactionModal] = useState(false);

  const [editingPost, setEditingPost] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editMode, setEditMode] = useState<"content" | "time">("content");
  const [showCustomPostModal, setShowCustomPostModal] = useState(false);

  // Action Menu State
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);

  // Analytics sync
  const [syncing, setSyncing] = useState(false);
  const syncAnalytics = async () => {
    setSyncing(true);
    try {
      const res = await fetch(`${API_URL}/v1/analytics/sync`, { method: "POST", credentials: "include" });
      const result = await res.json();
      if (!res.ok) throw new Error(result?.error?.message ?? result?.error ?? "Sync failed.");
      // Reload dashboard to get fresh analytics
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.furciai.com";
      const fresh = await fetch(`${apiUrl}/v1/dashboard`, { credentials: "include" });
      if (fresh.ok) setData(await fresh.json());
    } catch (e: any) {
      alert("Sync failed: " + e.message);
    } finally {
      setSyncing(false);
    }
  };

  // Pro upgrade modal
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeCode, setUpgradeCode] = useState("");
  const [upgrading, setUpgrading] = useState(false);

  const handleUpgrade = async () => {
    if (!upgradeCode.trim()) return;
    setUpgrading(true);
    try {
      const res = await fetch(`${API_URL}/v1/plan/upgrade`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ upgradeCode }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result?.error?.message ?? result?.error ?? "Upgrade failed.");
      setShowUpgradeModal(false);
      window.location.reload();
    } catch (e: any) {
      alert("Upgrade failed: " + e.message);
    } finally {
      setUpgrading(false);
    }
  };

  // Per-post media generation state
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.furciai.com";
  const [mediaLoading, setMediaLoading]   = useState<Record<number, boolean>>({});
  const [videoTasks,   setVideoTasks]     = useState<Record<number, { taskId: string; status: string; videoUrl?: string }>>({});
  const [postMedia,    setPostMedia]      = useState<Record<number, { videoUrl?: string; imageUrls?: string[] }>>({});

  const saveMediaToPost = async (postId: number, videoUrl?: string, imageUrls?: string[]) => {
    try {
      await fetch(`${API_URL}/v1/posts/${postId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          videoUrl:      videoUrl      || undefined,
          imageUrlsJson: imageUrls     ? JSON.stringify(imageUrls) : undefined,
        }),
      });
    } catch { /* non-critical — media is shown locally even if save fails */ }
  };

  // Designed carousel slides via FFmpeg (no AI cost)
  const designCarouselForPost = async (post: any) => {
    setMediaLoading(p => ({ ...p, [post.id]: true }));
    try {
      const res = await fetch(`${API_URL}/v1/carousel/design`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ postId: post.id }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.error?.message ?? errData?.error ?? `HTTP ${res.status}`);
      }
      const data = await res.json();
      setPostMedia(p => ({ ...p, [post.id]: { ...p[post.id], imageUrls: data.imageUrls } }));
    } catch (e: any) {
      alert("Carousel design failed: " + e.message);
    } finally {
      setMediaLoading(p => ({ ...p, [post.id]: false }));
    }
  };

  const generateImagesForPost = async (post: any) => {
    setMediaLoading(p => ({ ...p, [post.id]: true }));
    try {
      // Build prompts from slides JSON or fall back to a single visual prompt
      let prompts: string[] = [];
      if (post.slidesJson) {
        try { prompts = JSON.parse(post.slidesJson); } catch { prompts = []; }
      }
      if (prompts.length === 0) prompts = [post.content?.slice(0, 200) || "Social media carousel"];

      const res = await fetch(`${API_URL}/v1/carousel/images`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ visualPrompts: prompts }),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e?.error?.message ?? e?.error ?? "Failed."); }
      const data = await res.json();
      const urls: string[] = (data.images || []).map((img: any) => img.url);
      setPostMedia(p => ({ ...p, [post.id]: { ...p[post.id], imageUrls: urls } }));
      await saveMediaToPost(post.id, undefined, urls);
    } catch (e: any) {
      alert("Image generation failed: " + e.message);
    } finally {
      setMediaLoading(p => ({ ...p, [post.id]: false }));
    }
  };

  // Template video — FFmpeg-based, synchronous, no credits needed
  const generateSlideVideoForPost = async (post: any) => {
    setMediaLoading(p => ({ ...p, [post.id]: true }));
    try {
      const res = await fetch(`${API_URL}/v1/video/template`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ postId: post.id }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.error?.message ?? errData?.error ?? `HTTP ${res.status}`);
      }
      const data = await res.json();
      setPostMedia(p => ({ ...p, [post.id]: { ...p[post.id], videoUrl: data.videoUrl } }));
      await saveMediaToPost(post.id, data.videoUrl);
    } catch (e: any) {
      alert("Slide video failed: " + e.message);
    } finally {
      setMediaLoading(p => ({ ...p, [post.id]: false }));
    }
  };

  const generateVideoForPost = async (post: any) => {
    setMediaLoading(p => ({ ...p, [post.id]: true }));
    try {
      const promptText = post.script?.split("\n")[0] || post.content?.slice(0, 200) || post.hook || "Dynamic social media video";
      const res = await fetch(`${API_URL}/v1/video/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ promptText, duration: 5, ratio: "720:1280" }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.error?.message ?? errData?.error ?? errData?.detail ?? `HTTP ${res.status}`);
      }
      const taskData = await res.json();
      setVideoTasks(p => ({ ...p, [post.id]: taskData }));
      pollVideoForPost(post.id, taskData.taskId);
    } catch (e: any) {
      alert("Video generation failed: " + e.message);
    } finally {
      setMediaLoading(p => ({ ...p, [post.id]: false }));
    }
  };

  const pollVideoForPost = (postId: number, taskId: string) => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API_URL}/v1/video/status/${taskId}`, { credentials: "include" });
        const data = await res.json();
        setVideoTasks(p => ({ ...p, [postId]: data }));
        if (data.status === "SUCCEEDED" || data.status === "FAILED") {
          clearInterval(interval);
          if (data.status === "SUCCEEDED" && data.videoUrl) {
            setPostMedia(p => ({ ...p, [postId]: { ...p[postId], videoUrl: data.videoUrl } }));
            await saveMediaToPost(postId, data.videoUrl);
          }
        }
      } catch { clearInterval(interval); }
    }, 5000);
  };

  useEffect(() => {
    const handleClickOutside = () => setActiveMenuId(null);
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.furciai.com";
        const response = await fetch(`${apiUrl}/v1/dashboard`, { credentials: "include" });
        if (!response.ok) throw new Error("Failed to load dashboard");
        const json = await response.json();
        setData(json);

        // Find autopilot status for current platform
        const platform = session?.platform || "twitter";
        const account = json.socialAccounts.find((a: any) => a.platform === platform);
        if (account) setAutopilot(account.autoPilotEnabled);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [session]);

  const toggleAutopilot = async () => {
    setIsToggling(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.furciai.com";
      await fetch(`${apiUrl}/v1/settings/autopilot`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          platform: session?.platform || "twitter",
          enabled: !autopilot
        }),
      });
      setAutopilot(!autopilot);
    } catch (err) {
      alert("Failed to toggle autopilot");
    } finally {
      setIsToggling(false);
    }
  };

  const disconnectAccount = async (platform: string) => {
    if (!window.confirm(`⚠️ Are you sure you want to disconnect Furci from ${platform.toUpperCase()}? This will wipe your tokens and stop all scheduled posts.`)) {
      return;
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.furciai.com";
      const response = await fetch(`${apiUrl}/v1/auth/disconnect`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ platform }),
      });

      if (!response.ok) throw new Error("Failed to disconnect");
      
      router.push("/");
    } catch (err) {
      alert("Error disconnecting account");
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(d);
  };

  const handleTrendReact = async (topic: string) => {
    setSelectedTrend(topic);
    setShowReactionModal(true);
    setLoadingReaction(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.furciai.com";
      const response = await fetch(`${apiUrl}/v1/trends/react`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ topic }),
      });
      if (!response.ok) throw new Error("Failed to generate take");
      const json = await response.json();
      setTrendReaction(json.reaction);
    } catch (err) {
      alert("Error generating trend reaction");
    } finally {
      setLoadingReaction(false);
    }
  };

  const handleTrendApprove = async (content: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.furciai.com";
      const response = await fetch(`${apiUrl}/v1/trends/react/schedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
            content,
            platform: session?.platform || "twitter"
        }),
      });
      if (!response.ok) throw new Error("Failed to schedule");
      alert("Reaction scheduled! Heading to your queue...");
      setShowReactionModal(false);
      window.location.reload(); // Refresh to see the new item in queue
    } catch (err) {
      alert("Error scheduling reaction");
    }
  };

  const handleUpdatePost = async (id: number, content: string, scheduledAt: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.furciai.com";
      // datetime-local gives "YYYY-MM-DDTHH:mm" — convert to full ISO string so Go can parse it
      const scheduledAtISO = scheduledAt ? new Date(scheduledAt).toISOString() : undefined;
      const response = await fetch(`${apiUrl}/v1/posts/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ content, scheduledAt: scheduledAtISO }),
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData?.error?.message ?? errData?.error ?? "Failed to update post.");
      }
      setShowEditModal(false);
      window.location.reload();
    } catch (err: any) {
      alert("Error updating post: " + err.message);
    }
  };

  const handleDeletePost = async (id: number) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.furciai.com";
      const response = await fetch(`${apiUrl}/v1/posts/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to delete post");
      setShowEditModal(false);
      window.location.reload();
    } catch (err) {
      alert("Error deleting post");
    }
  };

  if (loading) {
    return <div className="page center"><h2>Furci is preparing your command center...</h2></div>;
  }

  if (!data) return <div className="page center"><h2>No active strategy found. Go to Strategy first!</h2></div>;

  const hourOfDay = new Date().getHours();
  const greeting = hourOfDay < 12 ? "Good morning" : hourOfDay < 17 ? "Good afternoon" : "Good evening";
  const firstName = user?.name?.split(" ")[0] || "there";

  return (
    <>
      <div className="page dashboard-page" style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto', overflowX: 'hidden' }}>
      {/* Greeting & Stats */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ minWidth: 0 }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.2rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {greeting}, {firstName} ⚡
          </h1>
          {user?.username && (
            <p style={{ color: 'var(--primary-strong)', fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>@{user.username}</p>
          )}
          <p style={{ color: 'var(--muted)', fontSize: '1rem', margin: '0.25rem 0 0' }}>Your brand is scaling on autopilot.</p>
        </div>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div className="stat-card">
            <label>QUEUE</label>
            <div className="value">{data.stats.totalPosts} Posts</div>
          </div>
          <div className="stat-card">
            <label>EXPERIMENTS</label>
            <div className="value">{data.stats.activeExperiments} Active</div>
          </div>
          <div className="stat-card highlight">
            <label>IMPACT SCORE</label>
            <div className="value">{data.stats.impactScore}</div>
          </div>
        </div>
      </div>

      {/* ── Analytics Bar ─────────────────────────────────────────────── */}
      {(() => {
        const a = data.analytics;
        const hasSynced = a.postsAnalyzed > 0;
        const fmt = (n: number) => n >= 1000 ? `${(n/1000).toFixed(1)}k` : String(n);
        const engColor = a.avgEngRate >= 5 ? '#16a34a' : a.avgEngRate >= 2 ? '#d97706' : '#6b7280';

        return (
          <div style={{ background: '#fff', borderRadius: '20px', padding: '1.25rem 1.5rem', marginBottom: '2rem', border: '1px solid #f0f0f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            {/* Header row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <span style={{ fontWeight: 800, fontSize: '1rem', color: '#111' }}>📊 Performance</span>
                {a.lastSynced && (
                  <span style={{ fontSize: '0.72rem', color: '#9ca3af', marginLeft: '0.6rem' }}>
                    Last synced {new Date(a.lastSynced).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </div>
              <button
                onClick={syncAnalytics}
                disabled={syncing}
                style={{ fontSize: '0.78rem', fontWeight: 700, padding: '0.4rem 0.9rem', borderRadius: '8px', border: '1.5px solid #4f46e5', color: syncing ? '#999' : '#4f46e5', background: syncing ? '#f5f5f5' : '#eef2ff', cursor: syncing ? 'not-allowed' : 'pointer' }}
              >
                {syncing ? 'Syncing…' : '🔄 Sync Now'}
              </button>
            </div>

            {/* Metric tiles — Buffer-style summary row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.6rem', marginBottom: hasSynced ? '1rem' : 0 }}>
              {[
                { label: 'Posts', value: String(a.postsAnalyzed || data.stats.totalPosts), color: '#6366f1' },
                { label: 'Reactions', value: fmt(a.totalReactions), color: '#f59e0b' },
                { label: 'Comments', value: fmt(0), color: '#ec4899' },
                { label: 'Avg Eng Rate', value: `${a.avgEngRate.toFixed(2)}%`, color: engColor },
                { label: 'Impressions', value: fmt(a.totalImpressions), color: '#0ea5e9' },
              ].map(tile => (
                <div key={tile.label} style={{ textAlign: 'center', padding: '0.65rem 0.4rem', background: '#f9fafb', borderRadius: '12px', minWidth: 0 }}>
                  <div style={{ fontSize: '1.2rem', fontWeight: 900, color: tile.color, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tile.value}</div>
                  <div style={{ fontSize: '0.62rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', marginTop: '0.15rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tile.label}</div>
                </div>
              ))}
            </div>

            {/* AI insight */}
            {a.insight && (
              <div style={{ fontSize: '0.82rem', color: '#374151', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '0.6rem 0.9rem', marginBottom: hasSynced ? '1rem' : 0 }}>
                💡 {a.insight}
              </div>
            )}

            {/* Top posts table — Buffer-style */}
            {hasSynced && a.topPosts.length > 0 && (
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Top Posts</div>
                {/* Header row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 60px 70px 60px 70px 60px', gap: '0.5rem', padding: '0.3rem 0.75rem', fontSize: '0.65rem', fontWeight: 800, color: '#c0c4cc', textTransform: 'uppercase' }}>
                  <span>Post</span>
                  <span style={{ textAlign: 'center' }}>Platform</span>
                  <span style={{ textAlign: 'center' }}>Reactions</span>
                  <span style={{ textAlign: 'center' }}>Comments</span>
                  <span style={{ textAlign: 'center' }}>Impressions</span>
                  <span style={{ textAlign: 'center' }}>Eng Rate</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  {a.topPosts.slice(0, 5).map((p, i) => (
                    <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 60px 70px 60px 70px 60px', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem', background: '#f9fafb', borderRadius: '10px', fontSize: '0.82rem', minWidth: 0 }}>
                      <span style={{ color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>{p.snippet?.slice(0, 100) || ''}</span>
                      <span style={{ textAlign: 'center', fontSize: '0.7rem', fontWeight: 700, color: '#6366f1', background: '#ede9fe', borderRadius: '6px', padding: '0.1rem 0.3rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.platform || '—'}</span>
                      <span style={{ textAlign: 'center', color: '#f59e0b', fontWeight: 700 }}>❤️ {p.likes + p.reposts}</span>
                      <span style={{ textAlign: 'center', color: '#6b7280' }}>💬 {p.comments}</span>
                      <span style={{ textAlign: 'center', color: '#0ea5e9' }}>👁️ {fmt(p.impressions)}</span>
                      <span style={{ textAlign: 'center', fontWeight: 800, color: engColor }}>{p.engRate.toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Follower growth chart */}
            {a.followerCount > 0 && (
              <div style={{ marginTop: hasSynced ? '1rem' : 0 }}>
                <FollowerGrowthChart
                  data={a.followerHistory || []}
                  currentCount={a.followerCount}
                  growth={a.followerGrowth || 0}
                />
              </div>
            )}

            {!hasSynced && !a.followerCount && (
              <p style={{ fontSize: '0.82rem', color: '#9ca3af', textAlign: 'center', margin: 0 }}>
                Hit <strong>Sync Now</strong> after posting to pull live metrics from Twitter/X.
              </p>
            )}
          </div>
        );
      })()}

      <ReactionModal
        isOpen={showReactionModal}
        onClose={() => setShowReactionModal(false)}
        topic={selectedTrend}
        reaction={trendReaction}
        loading={loadingReaction}
        onApprove={handleTrendApprove}
      />

      {/* Pro Upgrade Modal */}
      {showUpgradeModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: '20px', padding: '2.5rem', maxWidth: '440px', width: '90%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🚀</div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.5rem' }}>Upgrade to Pro</h2>
              <p style={{ color: '#666', fontSize: '0.95rem', lineHeight: 1.5 }}>
                AI Video generation (Runway ML) is a <strong>Pro plan</strong> feature.
                Enter your upgrade code below to unlock it.
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <input
                type="text"
                placeholder="Enter upgrade code"
                value={upgradeCode}
                onChange={e => setUpgradeCode(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleUpgrade()}
                style={{ padding: '0.75rem 1rem', borderRadius: '10px', border: '1.5px solid #e5e7eb', fontSize: '0.95rem', outline: 'none' }}
              />
              <button
                onClick={handleUpgrade}
                disabled={upgrading || !upgradeCode.trim()}
                style={{ padding: '0.75rem', borderRadius: '10px', background: upgrading ? '#e5e7eb' : '#4f46e5', color: upgrading ? '#999' : '#fff', fontWeight: 700, border: 0, cursor: upgrading ? 'not-allowed' : 'pointer', fontSize: '0.95rem' }}
              >
                {upgrading ? "Upgrading…" : "Activate Pro"}
              </button>
              <button
                onClick={() => { setShowUpgradeModal(false); setUpgradeCode(""); }}
                style={{ padding: '0.6rem', borderRadius: '10px', background: 'transparent', border: '1px solid #e5e7eb', color: '#666', cursor: 'pointer', fontSize: '0.9rem' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {editingPost && (
        <EditPostModal 
          key={editingPost.id}
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          post={editingPost}
          onSave={handleUpdatePost}
          onDelete={handleDeletePost}
          initialMode={editMode}
        />
      )}

      <CustomPostModal
        isOpen={showCustomPostModal}
        onClose={() => setShowCustomPostModal(false)}
        onSuccess={() => window.location.reload()}
        connectedPlatforms={data.socialAccounts?.map((a: any) => a.platform) || []}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem', minWidth: 0 }}>
        {/* Main Column: Content Queue + Post History */}
        <section style={{ minWidth: 0, overflow: 'hidden' }}>
          <FurciChat />
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.5rem' }}>📅 Content Queue</h3>
            <button 
              onClick={() => setShowCustomPostModal(true)}
              style={{ 
                padding: '0.6rem 1.2rem', 
                borderRadius: '12px', 
                background: '#e6f4ff', 
                color: 'var(--primary-strong)', 
                border: 0, 
                fontWeight: 700,
                cursor: 'pointer' 
              }}>
              + Add Custom Post
            </button>
          </div>

          <div style={{ display: 'grid', gap: '1rem' }}>
            {data.calendar.length > 0 ? data.calendar.map((item, i) => {
              const typeMap: Record<string, { label: string; color: string; bg: string; icon: string }> = {
                tweet:         { label: "Tweet",        color: "#1d9bf0", bg: "#e8f5fe", icon: "𝕏" },
                thread:        { label: "Thread",       color: "#1565c0", bg: "#e3f0ff", icon: "🧵" },
                carousel:      { label: "Carousel",     color: "#7b2ff7", bg: "#f3e8ff", icon: "🖼️" },
                video_script:  { label: "Video Script", color: "#d32f2f", bg: "#fdecea", icon: "🎬" },
                linkedin_post: { label: "LinkedIn",     color: "#0a66c2", bg: "#e8f0f9", icon: "💼" },
              };
              const tc = typeMap[item.contentType] || { label: "Post", color: "#555", bg: "#f5f5f5", icon: "📝" };
              return (
              <div key={i} className="queue-item card" style={{ display: 'flex', gap: '1.5rem', padding: '1.5rem', borderRadius: '20px', alignItems: 'center', minWidth: 0, overflow: 'hidden' }}>
                <div style={{ textAlign: 'center', minWidth: '80px', padding: '0.8rem', background: '#f0f7ff', borderRadius: '16px' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--primary-strong)', display: 'block' }}>SCHEDULED</span>
                    <div style={{ fontSize: '0.9rem', fontWeight: 900, marginTop: '0.2rem' }}>{formatDate(item.scheduledAt)}</div>
                </div>
                <div style={{ flex: 1, position: 'relative', minWidth: 0, overflow: 'hidden' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', flex: 1, minWidth: 0 }}>
                        {/* Content type badge */}
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.72rem', fontWeight: 700, color: tc.color, background: tc.bg, borderRadius: '999px', padding: '0.15rem 0.6rem', width: 'fit-content' }}>
                          {tc.icon} {tc.label}
                        </span>
                        <div style={{ fontWeight: 700, color: '#093f67' }}>{item.content.split('\n')[0]}</div>
                      </div>
                        <div style={{ position: 'relative' }}>
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveMenuId(activeMenuId === item.id ? null : item.id);
                                }}
                                style={{ background: 'transparent', border: 0, cursor: 'pointer', padding: '0.5rem', color: 'var(--muted)' }}
                            >
                                <MoreVertical size={20} />
                            </button>

                            {activeMenuId === item.id && (
                                <div className="dropdown" style={{
                                    position: 'absolute',
                                    top: '100%',
                                    right: 0,
                                    width: '180px',
                                    background: 'white',
                                    borderRadius: '12px',
                                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                                    zIndex: 100,
                                    padding: '0.5rem',
                                    border: '1px solid #f0f0f0',
                                    animation: 'fadeIn 0.2s ease'
                                }}>
                                    <button 
                                        onClick={() => { setEditingPost(item); setEditMode("content"); setShowEditModal(true); }}
                                        style={{ width: '100%', textAlign: 'left', padding: '0.7rem', background: 'transparent', border: 0, borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.8rem', fontSize: '0.9rem', fontWeight: 600, color: '#444' }}
                                    >
                                        <Edit2 size={16} /> Edit Content
                                    </button>
                                    <button 
                                        onClick={() => { setEditingPost(item); setEditMode("time"); setShowEditModal(true); }}
                                        style={{ width: '100%', textAlign: 'left', padding: '0.7rem', background: 'transparent', border: 0, borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.8rem', fontSize: '0.9rem', fontWeight: 600, color: '#444' }}
                                    >
                                        <Clock size={16} /> Reschedule
                                    </button>
                                    <div style={{ height: '1px', background: '#f0f0f0', margin: '0.4rem 0' }}></div>
                                    <button 
                                        onClick={() => handleDeletePost(item.id)}
                                        style={{ width: '100%', textAlign: 'left', padding: '0.7rem', background: 'transparent', border: 0, borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.8rem', fontSize: '0.9rem', fontWeight: 600, color: '#ff4d4d' }}
                                    >
                                        <Trash2 size={16} /> Delete Post
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                    <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.content.substring(0, 100)}{item.content.length > 100 ? '...' : ''}</p>

                    {/* ── Inline Media Section ── */}
                    {(() => {
                      const media    = postMedia[item.id] || {};
                      const task     = videoTasks[item.id];
                      const loading  = mediaLoading[item.id];
                      // Prefer live state, fall back to values already saved in DB
                      const videoUrl    = media.videoUrl    || item.videoUrl;
                      const imageUrls: string[] = media.imageUrls || (() => {
                        try { return item.imageUrlsJson ? JSON.parse(item.imageUrlsJson) : []; } catch { return []; }
                      })();
                      const isVideo    = item.contentType === "video_script";
                      const isCarousel = item.contentType === "carousel";
                      return (
                        <div style={{ marginTop: '0.75rem', borderTop: '1px solid #f0f0f0', paddingTop: '0.75rem' }}>
                          {/* Video player — shows for any post that has a video URL */}
                          {videoUrl && (
                            <video
                              src={videoUrl}
                              controls
                              style={{ width: '100%', maxHeight: '220px', borderRadius: '12px', background: '#000', display: 'block', marginBottom: '0.5rem' }}
                            />
                          )}
                          {/* AI video task status while polling */}
                          {isVideo && task && !task.videoUrl && (
                            <div style={{ fontSize: '0.8rem', color: '#d32f2f', fontWeight: 600, padding: '0.5rem 0' }}>
                              {task.status === "SUCCEEDED" ? "Video ready!" : `Generating AI video… ${task.status}`}
                            </div>
                          )}
                          {/* Carousel image strip */}
                          {isCarousel && imageUrls.length > 0 && (
                            <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
                              {imageUrls.map((url, idx) => (
                                <a key={idx} href={url} target="_blank" rel="noopener noreferrer" style={{ flexShrink: 0 }}>
                                  <img
                                    src={url}
                                    alt={`Slide ${idx + 1}`}
                                    style={{ width: '72px', height: '72px', borderRadius: '8px', objectFit: 'cover', display: 'block' }}
                                  />
                                </a>
                              ))}
                            </div>
                          )}
                          {/* ── Media action buttons ── */}
                          {!videoUrl && (
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                              {/* Slide Video — free, works for all post types */}
                              <button
                                onClick={() => generateSlideVideoForPost(item)}
                                disabled={loading}
                                title="Generate a slide-style MP4 using FFmpeg — free, no AI credits needed"
                                style={{ fontSize: '0.78rem', fontWeight: 700, padding: '0.4rem 0.9rem', borderRadius: '8px', border: '1.5px solid #4f46e5', color: loading ? '#999' : '#4f46e5', background: loading ? '#f5f5f5' : '#eef2ff', cursor: loading ? 'not-allowed' : 'pointer' }}
                              >
                                {loading ? "Building…" : "📽️ Slide Video (Free)"}
                              </button>
                              {/* AI Video — Pro only, video_script posts only */}
                              {isVideo && !task && (
                                data?.plan === "pro" ? (
                                  <button
                                    onClick={() => generateVideoForPost(item)}
                                    disabled={loading}
                                    title="Generate a cinematic AI video using Runway ML — Pro feature"
                                    style={{ fontSize: '0.78rem', fontWeight: 700, padding: '0.4rem 0.9rem', borderRadius: '8px', border: '1.5px solid #d32f2f', color: loading ? '#999' : '#d32f2f', background: '#fff', cursor: loading ? 'not-allowed' : 'pointer' }}
                                  >
                                    {loading ? "Starting…" : "🎬 AI Video (Runway)"}
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => setShowUpgradeModal(true)}
                                    title="AI Video requires Pro plan"
                                    style={{ fontSize: '0.78rem', fontWeight: 700, padding: '0.4rem 0.9rem', borderRadius: '8px', border: '1.5px dashed #f59e0b', color: '#b45309', background: '#fffbeb', cursor: 'pointer' }}
                                  >
                                    🔒 AI Video — Pro Only
                                  </button>
                                )
                              )}
                            </div>
                          )}
                          {/* Carousel buttons */}
                          {isCarousel && imageUrls.length === 0 && (
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                              {/* Designed slides — FFmpeg, free */}
                              <button
                                onClick={() => designCarouselForPost(item)}
                                disabled={loading}
                                title="Render designed slides with text + branding using FFmpeg — free"
                                style={{ fontSize: '0.78rem', fontWeight: 700, padding: '0.4rem 0.9rem', borderRadius: '8px', border: '1.5px solid #4f46e5', color: loading ? '#999' : '#4f46e5', background: loading ? '#f5f5f5' : '#eef2ff', cursor: loading ? 'not-allowed' : 'pointer' }}
                              >
                                {loading ? "Designing…" : "🎨 Design Slides (Free)"}
                              </button>
                              {/* DALL-E image backgrounds */}
                              <button
                                onClick={() => generateImagesForPost(item)}
                                disabled={loading}
                                title="Generate AI image backgrounds with DALL-E 3 — uses OpenAI credits"
                                style={{ fontSize: '0.78rem', fontWeight: 700, padding: '0.4rem 0.9rem', borderRadius: '8px', border: '1.5px solid #7b2ff7', color: loading ? '#999' : '#7b2ff7', background: '#fff', cursor: loading ? 'not-allowed' : 'pointer' }}
                              >
                                {loading ? "Generating…" : "🖼️ AI Image Backgrounds"}
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                </div>
                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end', minWidth: '80px' }}>
                    <span className="badge" style={{ textTransform: 'uppercase' }}>{item.platform}</span>
                    <div style={{ fontSize: '0.75rem', color: '#5ec26a', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <span style={{ width: '8px', height: '8px', background: '#5ec26a', borderRadius: '50%' }}></span>
                        QUEUED
                    </div>
                </div>
              </div>
              );
            }) : (
                <div className="card center" style={{ padding: '4rem', textAlign: 'center' }}>
                    <p style={{ fontSize: '1.2rem', color: 'var(--muted)' }}>Nothing scheduled yet. Generate a calendar to start!</p>
                </div>
            )}
          </div>
          {/* ── Performance per Post — high-fidelity table ── */}
          {data.history && data.history.length > 0 && (
            <section style={{ marginTop: '3rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.5rem', margin: 0 }}>📊 Performance per Post</h3>
                <span style={{ fontSize: '0.85rem', color: 'var(--muted)', fontWeight: 600 }}>Showing last 20 posts</span>
              </div>
              
              <div style={{ background: 'white', borderRadius: '24px', border: '1px solid #f0f0f0', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                {/* Table Header */}
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'minmax(200px, 2fr) 100px 90px 90px 90px 100px 100px', 
                  padding: '1.25rem 1.5rem', 
                  background: '#f9fafb', 
                  borderBottom: '1px solid #f0f0f0',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  color: '#9ca3af',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  <span>Post Details</span>
                  <span style={{ textAlign: 'center' }}>Status</span>
                  <span style={{ textAlign: 'center' }}>Likes</span>
                  <span style={{ textAlign: 'center' }}>Reposts</span>
                  <span style={{ textAlign: 'center' }}>Comments</span>
                  <span style={{ textAlign: 'center' }}>Impressions</span>
                  <span style={{ textAlign: 'center' }}>Eng. Rate</span>
                </div>

                {/* Table Body */}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {data.history.map((item: any, i: number) => {
                    const posted = item.status === "posted";
                    const a = item.analytics || {};
                    const engColor = (a.engagementRate || 0) >= 5 ? '#16a34a' : (a.engagementRate || 0) >= 2 ? '#d97706' : '#6b7280';
                    const fmt = (n: number) => n >= 1000 ? `${(n/1000).toFixed(1)}k` : String(n || 0);

                    return (
                      <div key={i} className="history-row" style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'minmax(200px, 2fr) 100px 90px 90px 90px 100px 100px', 
                        alignItems: 'center', 
                        padding: '1.25rem 1.5rem',
                        borderBottom: i === data.history.length - 1 ? 'none' : '1px solid #f8f9fa',
                        transition: 'background 0.2s ease',
                      }}>
                        {/* 1. Post Details + Thumbnail */}
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', minWidth: 0 }}>
                           {/* Thumbnail */}
                           <div style={{ 
                              width: '44px', 
                              height: '44px', 
                              borderRadius: '8px', 
                              background: '#f3f4f6', 
                              flexShrink: 0, 
                              overflow: 'hidden',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              border: '1px solid #eee'
                           }}>
                              {(() => {
                                 let thumbUrl = "";
                                 try {
                                    const images = item.imageUrlsJson ? JSON.parse(item.imageUrlsJson) : [];
                                    if (images.length > 0) thumbUrl = images[0];
                                    else if (item.videoUrl) return <span style={{ fontSize: '1.2rem' }}>🎬</span>;
                                 } catch { /* ignore */ }
                                 
                                 return thumbUrl ? (
                                    <img src={thumbUrl} alt="Thumbnail" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                 ) : (
                                    <span style={{ fontSize: '1.2rem' }}>📝</span>
                                 );
                              })()}
                           </div>

                           <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', minWidth: 0 }}>
                              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#111', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                 {item.content?.split('\n')[0]?.slice(0, 80) || '(no content)'}
                              </div>
                              <div style={{ fontSize: '0.75rem', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                 <span style={{ color: '#6366f1', fontWeight: 700 }}>{item.platform?.toUpperCase()}</span>
                                 <span>•</span>
                                 <span>{formatDate(item.createdAt)}</span>
                              </div>
                           </div>
                        </div>

                        {/* 2. Status */}
                        <div style={{ textAlign: 'center' }}>
                           <span style={{ 
                              fontSize: '0.65rem', 
                              fontWeight: 900, 
                              padding: '0.25rem 0.6rem', 
                              borderRadius: '999px',
                              background: posted ? '#dcfce7' : '#fee2e2',
                              color: posted ? '#15803d' : '#dc2626'
                           }}>
                              {posted ? 'POSTED' : 'FAILED'}
                           </span>
                        </div>

                        {/* 3. Likes */}
                        <div style={{ textAlign: 'center', fontWeight: 700, color: '#374151' }}>
                           {fmt(a.likes)}
                        </div>

                        {/* 4. Reposts (User specific request) */}
                        <div style={{ textAlign: 'center', fontWeight: 700, color: '#6366f1' }}>
                           {fmt(a.reposts)}
                        </div>

                        {/* 5. Comments */}
                        <div style={{ textAlign: 'center', fontWeight: 700, color: '#374151' }}>
                           {fmt(a.comments)}
                        </div>

                        {/* 6. Impressions */}
                        <div style={{ textAlign: 'center', fontWeight: 700, color: '#0ea5e9' }}>
                           {fmt(a.impressions)}
                        </div>

                        {/* 7. Engagement Rate */}
                        <div style={{ textAlign: 'center', fontWeight: 900, color: engColor }}>
                           {(a.engagementRate || 0).toFixed(1)}%
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          )}
        </section>

        <aside style={{ display: 'grid', gap: '2rem', height: 'fit-content', minWidth: 0 }}>
          {/* Ghost Operator / Engagement Feed */}
          <EngagementFeed />

          {/* Trending Widget */}
          <TrendingWidget onReact={handleTrendReact} />
          
          {/* Identity Widget */}
          <div className="card highlight-border" style={{ padding: '2rem', borderRadius: '24px', background: '#fff9f0' }}>
             <h4 style={{ color: '#b25e09', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>🕵️‍♂️</span> Brand Pivot
             </h4>
             <p style={{ fontSize: '0.95rem', lineHeight: '1.6', color: '#5f442b' }}>
                {data.strategy?.identityAudit || "Generating your brand aura..."}
             </p>
          </div>

          {/* Autopilot Master Switch */}
          <div className="card" style={{ padding: '2rem', borderRadius: '24px', textAlign: 'center' }}>
             <h4 style={{ marginBottom: '0.5rem' }}>Auto-Pilot Settings</h4>
             <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                Furci will post automatically to your connected accounts.
             </p>

              <button 
                onClick={() => router.push("/analytics")}
                style={{
                  width: '100%',
                  padding: '1rem',
                  background: '#f0f7ff',
                  border: '2px solid var(--primary-strong)',
                  color: 'var(--primary-strong)',
                  borderRadius: '16px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                Detailed Impact Analytics 📊
              </button>

             <div 
               onClick={toggleAutopilot}
               style={{ 
                 width: '100%', 
                 height: '60px', 
                 background: autopilot ? 'var(--primary-strong)' : '#f0f0f0', 
                 borderRadius: '30px', 
                 position: 'relative', 
                 cursor: 'pointer',
                 transition: 'all 0.3s ease',
                 display: 'flex',
                 alignItems: 'center',
                 padding: '0 5px',
                 marginBottom: '1rem'
               }}
             >
                <div style={{ 
                    width: '50px', 
                    height: '50px', 
                    background: 'white', 
                    borderRadius: '50%', 
                    boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                    transition: 'all 0.3s ease',
                    transform: autopilot ? 'translateX(calc(310px - 60px))' : 'translateX(0)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem'
                }}>
                    {autopilot ? '🚀' : '⏸️'}
                </div>
                {!isToggling && (
                    <span style={{ 
                        position: 'absolute', 
                        left: autopilot ? '2rem' : 'auto', 
                        right: autopilot ? 'auto' : '2rem',
                        fontWeight: 800,
                        color: autopilot ? 'white' : '#999',
                        textTransform: 'uppercase'
                    }}>
                        {autopilot ? 'Enabled' : 'Disabled'}
                    </span>
                )}
             </div>

             <button 
               onClick={() => disconnectAccount(session?.platform || "twitter")}
               style={{
                 width: '100%',
                 padding: '1rem',
                 background: 'transparent',
                 border: '2px solid #ff4d4d',
                 color: '#ff4d4d',
                 borderRadius: '16px',
                 fontWeight: 800,
                 cursor: 'pointer',
                 transition: 'all 0.2s ease'
               }}
               onMouseEnter={(e) => {
                 e.currentTarget.style.background = '#ff4d4d';
                 e.currentTarget.style.color = 'white';
               }}
               onMouseLeave={(e) => {
                 e.currentTarget.style.background = 'transparent';
                 e.currentTarget.style.color = '#ff4d4d';
               }}
             >
                Disconnect Account ✋
             </button>
          </div>

          {/* Upgrade Card */}
          <div className="card" style={{ 
            padding: '2rem', 
            borderRadius: '24px', 
            background: 'linear-gradient(135deg, #093f67, #1e5c8a)', 
            color: 'white',
            textAlign: 'center' 
          }}>
             <h4 style={{ color: '#8fd1ff', marginBottom: '0.5rem' }}>Trial Active (3 Days)</h4>
             <p style={{ fontSize: '0.85rem', marginBottom: '1.5rem', opacity: 0.8 }}>
                Unlock the full 14-day growth runway and advanced analytics.
             </p>
             <button style={{ 
                width: '100%', 
                padding: '1rem', 
                borderRadius: '12px', 
                background: '#8fd1ff', 
                color: '#093f67', 
                fontWeight: 800, 
                border: 0,
                cursor: 'wait' 
             }}>
                Upgrade Pro (Coming Soon)
             </button>
          </div>
        </aside>
      </div>
    </div>

      <style jsx>{`
        .stat-card {
            background: white;
            padding: 1.2rem 2rem;
            border-radius: 20px;
            border: 1px solid var(--border);
            text-align: center;
        }
        .stat-card label {
            display: block;
            font-size: 0.7rem;
            font-weight: 800;
            color: var(--muted);
            letter-spacing: 1px;
            margin-bottom: 0.3rem;
        }
        .stat-card .value {
            font-size: 1.5rem;
            font-weight: 900;
            color: var(--text);
        }
        .stat-card.highlight {
            border: 2px solid var(--primary-strong);
            background: #f0f7ff;
        }
        .highlight-border {
            border: 2px solid #ffead1 !important;
        }
        .queue-item:hover {
            transform: translateX(10px);
            border-color: var(--primary-strong);
        }
        .page { animation: fadeIn 0.5s ease; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </>
  );
}
