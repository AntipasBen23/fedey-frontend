"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import TrendingWidget from "@/components/TrendingWidget";
import ReactionModal from "@/components/ReactionModal";

type DashboardData = {
  calendar: any[];
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
};

export default function DashboardPage() {
  const router = useRouter();
  const { data: session } = useSession() as any;
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [autopilot, setAutopilot] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  // Trend Reaction State
  const [selectedTrend, setSelectedTrend] = useState("");
  const [trendReaction, setTrendReaction] = useState("");
  const [loadingReaction, setLoadingReaction] = useState(false);
  const [showReactionModal, setShowReactionModal] = useState(false);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://fedey-backend-production.up.railway.app";
        const response = await fetch(`${apiUrl}/v1/dashboard`);
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
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://fedey-backend-production.up.railway.app";
      await fetch(`${apiUrl}/v1/settings/autopilot`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://fedey-backend-production.up.railway.app";
      const response = await fetch(`${apiUrl}/v1/auth/disconnect`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
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
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://fedey-backend-production.up.railway.app";
      const response = await fetch(`${apiUrl}/v1/trends/react`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://fedey-backend-production.up.railway.app";
      const response = await fetch(`${apiUrl}/v1/trends/react/schedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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

  if (loading) {
    return <div className="page center"><h2>Furci is preparing your command center...</h2></div>;
  }

  if (!data) return <div className="page center"><h2>No active strategy found. Go to Strategy first!</h2></div>;

  return (
    <div className="page dashboard-page" style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header & Stats */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '3rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Autonomous Growth Engine ⚡</h1>
          <p style={{ color: 'var(--muted)', fontSize: '1.1rem' }}>Your brand is scaling on autopilot.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '2rem' }}>
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

      <ReactionModal 
        isOpen={showReactionModal}
        onClose={() => setShowReactionModal(false)}
        topic={selectedTrend}
        reaction={trendReaction}
        loading={loadingReaction}
        onApprove={handleTrendApprove}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>
        {/* Main Column: Content Queue */}
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.5rem' }}>📅 Content Queue</h3>
            <button style={{ 
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
            {data.calendar.length > 0 ? data.calendar.map((item, i) => (
              <div key={i} className="queue-item card" style={{ display: 'flex', gap: '1.5rem', padding: '1.5rem', borderRadius: '20px', alignItems: 'center' }}>
                <div style={{ textAlign: 'center', minWidth: '80px', padding: '0.8rem', background: '#f0f7ff', borderRadius: '16px' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--primary-strong)', display: 'block' }}>SCHEDULED</span>
                    <div style={{ fontSize: '0.9rem', fontWeight: 900, marginTop: '0.2rem' }}>{formatDate(item.scheduledAt)}</div>
                </div>
                <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, marginBottom: '0.3rem', color: '#093f67' }}>{item.content.split('\n')[0]}</div>
                    <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: 0 }}>{item.content.substring(0, 120)}...</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <span className="badge" style={{ marginBottom: '0.5rem', display: 'inline-block', textTransform: 'uppercase' }}>{item.platform}</span>
                    <div style={{ fontSize: '0.75rem', color: '#5ec26a', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <span style={{ width: '8px', height: '8px', background: '#5ec26a', borderRadius: '50%' }}></span>
                        QUEUED
                    </div>
                </div>
              </div>
            )) : (
                <div className="card center" style={{ padding: '4rem', textAlign: 'center' }}>
                    <p style={{ fontSize: '1.2rem', color: 'var(--muted)' }}>Nothing scheduled yet. Generate a calendar to start!</p>
                </div>
            )}
          </div>
        </section>

        <aside style={{ display: 'grid', gap: '2rem', height: 'fit-content' }}>
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
    </div>
  );
}
