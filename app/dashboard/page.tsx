"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

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
  const { data: session } = useSession() as any;
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [autopilot, setAutopilot] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

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
                <div style={{ textAlign: 'center', minWidth: '60px', padding: '0.5rem', background: '#f0f7ff', borderRadius: '12px' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--primary-strong)' }}>DAY</span>
                    <div style={{ fontSize: '1.5rem', fontWeight: 900 }}>{item.day}</div>
                </div>
                <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, marginBottom: '0.3rem', color: '#093f67' }}>{item.hook}</div>
                    <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: 0 }}>{item.content.substring(0, 100)}...</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <span className="badge" style={{ marginBottom: '0.5rem', display: 'inline-block' }}>{item.media}</span>
                    <div style={{ fontSize: '0.8rem', color: 'green', fontWeight: 700 }}>● Scheduled</div>
                </div>
              </div>
            )) : (
                <div className="card center" style={{ padding: '4rem', textAlign: 'center' }}>
                    <p style={{ fontSize: '1.2rem', color: 'var(--muted)' }}>Nothing scheduled yet. Generate a calendar to start!</p>
                </div>
            )}
          </div>
        </section>

        {/* Sidebar: Widgets & Settings */}
        <aside style={{ display: 'grid', gap: '2rem', height: 'fit-content' }}>
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
                 padding: '0 5px'
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
