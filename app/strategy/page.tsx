"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

type StrategyDetail = {
  identityAudit: string;
  trendMonitoring: string[];
  growthExperiments: string[];
  analyticsReporting: string[];
};

export default function StrategyPage() {
  const router = useRouter();
  const { data: session } = useSession() as any;
  const [strategy, setStrategy] = useState<StrategyDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  useEffect(() => {
    const fetchStrategy = async () => {
      try {
        const productSummary = localStorage.getItem("furciJobDescription") || "your product";
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://fedey-backend-production.up.railway.app";
        
        // 1. Identify Platform and Context
        const platform = session?.platform || "twitter";
        const accountType = localStorage.getItem(`furci_${platform}_context`) || "new";

        // 2. Generate Strategy with Audit
        const response = await fetch(`${apiUrl}/v1/strategy`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            productSummary,
            platform: platform,
            accountType: accountType
          }),
        });

        if (!response.ok) throw new Error("Failed to generate professional strategy");

        const data = await response.json();
        setStrategy(data);

        // 2. Handoff Token to Backend if session exists
        if (session?.accessToken) {
          setIsSyncing(true);
          const platform = session.platform as string;
          const accountType = localStorage.getItem(`furci_${platform}_context`) || "new";

          await fetch(`${apiUrl}/v1/auth/callback`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              accessToken: session.accessToken,
              platform: platform,
              accountType: accountType
            }),
          });
          setIsSyncing(false);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStrategy();
  }, [session]);

  const handleDisconnect = async () => {
    if (!confirm("Are you sure you want to disconnect your account? This will wipe your tokens.")) return;
    
    setIsDisconnecting(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://fedey-backend-production.up.railway.app";
      await fetch(`${apiUrl}/v1/auth/disconnect`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform: session?.platform || "twitter" }),
      });
      
      await signOut({ callbackUrl: "/connect" });
    } catch (err) {
      alert("Failed to disconnect correctly. Please try again.");
    } finally {
      setIsDisconnecting(false);
    }
  };

  if (loading) {
    return (
      <div className="page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
        <div className="animate-float" style={{ fontSize: '4rem', marginBottom: '1rem' }}>👁️</div>
        <h2 style={{ color: 'var(--text)', fontSize: '2rem' }}>Furci is auditing your profile...</h2>
        <p style={{ color: 'var(--muted)' }}>Analyzing your identity gap and preparing your pivot strategy.</p>
      </div>
    );
  }

  if (error || !strategy) {
    return (
      <div className="page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
         <h2 style={{ color: '#c53030' }}>Strategic Blockage</h2>
         <p>{error || "Could not generate strategy."}</p>
         <button onClick={() => window.location.reload()} className="btn-pulse" style={{ marginTop: '2rem', padding: '1rem 2rem', borderRadius: '12px', border: 0, background: 'var(--primary-strong)', color: 'white', fontWeight: '700', cursor: 'pointer' }}>Retry</button>
      </div>
    );
  }

  return (
    <div className="page" style={{ padding: '3rem 1rem', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '4rem', position: 'relative' }}>
        <button 
           onClick={handleDisconnect}
           disabled={isDisconnecting}
           style={{
             position: 'absolute',
             right: 0,
             top: 0,
             padding: '0.6rem 1rem',
             borderRadius: '10px',
             background: '#fff0f0',
             border: '1px solid #ffcccc',
             color: '#c53030',
             fontSize: '0.8rem',
             fontWeight: '700',
             cursor: 'pointer'
           }}
        >
          {isDisconnecting ? "Disconnecting..." : "Disconnect Account"}
        </button>

        <h1 style={{ fontSize: '3rem', color: 'var(--text)', margin: '0 0 0.5rem' }}>Growth Engine Strategy ⚡</h1>
        <p style={{ color: 'var(--muted)', fontSize: '1.2rem', margin: 0 }}>
          Professional tactics designed to scale your presence autonomously.
        </p>
      </div>

      <div style={{ display: 'grid', gap: '3rem' }}>
        {/* Identity Audit Section */}
        <div className="brand-card shadow-premium" style={{ 
          padding: '2.5rem', 
          borderRadius: '32px', 
          background: 'linear-gradient(160deg, #fff9f0, #ffffff)',
          border: '2px solid #ffead1' 
        }}>
          <h3 style={{ margin: '0 0 1rem', color: '#b25e09', fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <span>🕵️‍♂️</span> Identity Audit (Eyes On)
          </h3>
          <p style={{ fontSize: '1.2rem', lineHeight: '1.7', color: '#5f442b', margin: 0 }}>
            {strategy.identityAudit}
          </p>
        </div>
        {/* Trend Monitoring */}
        <div className="brand-card" style={{ padding: '2.5rem', borderRadius: '24px', border: '1px solid var(--border)' }}>
          <h3 style={{ margin: '0 0 1.5rem', color: '#0c4e7b', fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <span>📈</span> Trend Monitoring
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
            {strategy.trendMonitoring.map((tactic, i) => (
              <div key={i} style={{ padding: '1.2rem', background: 'rgba(255, 255, 255, 0.7)', borderRadius: '16px', border: '1px solid #dceeff', fontSize: '1.1rem', color: '#12324d', lineHeight: '1.5' }}>
                {tactic}
              </div>
            ))}
          </div>
        </div>

        {/* Growth Experiments */}
        <div className="trend-card" style={{ padding: '2.5rem', borderRadius: '24px', border: '1px solid var(--border)' }}>
          <h3 style={{ margin: '0 0 1.5rem', color: '#0c4e7b', fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <span>🧪</span> Growth Experiments
          </h3>
          <div style={{ display: 'grid', gap: '1rem' }}>
            {strategy.growthExperiments.map((exp, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', padding: '1.2rem', background: 'white', borderRadius: '16px', border: '1px solid #bfe4ff', boxShadow: '0 4px 12px rgba(36, 152, 255, 0.05)' }}>
                <span style={{ background: 'var(--primary-strong)', color: 'white', padding: '0.3rem 0.8rem', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 'bold' }}>HYPOTHESIS {i+1}</span>
                <span style={{ fontSize: '1.1rem', color: '#12324d', flex: 1 }}>{exp}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Analytics Reporting */}
        <div className="publishing-card" style={{ padding: '2.5rem', borderRadius: '24px', border: '1px solid var(--border)' }}>
          <h3 style={{ margin: '0 0 1.5rem', color: '#0c4e7b', fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <span>📊</span> Analytics Reporting
          </h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.2rem' }}>
            {strategy.analyticsReporting.map((metric, i) => (
              <li key={i} style={{ padding: '1.2rem', background: 'rgba(255, 255, 255, 0.6)', borderRadius: '16px', border: '1px dashed #8dcfff', textAlign: 'center', fontWeight: '600', color: '#093f67' }}>
                {metric}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div style={{ marginTop: '5rem', textAlign: 'center' }}>
        <button
          onClick={() => router.push("/calendar/generate")}
          className="btn-pulse"
          style={{
            border: '0',
            borderRadius: '999px',
            padding: '1.5rem 4rem',
            color: '#05345a',
            fontWeight: '800',
            fontSize: '1.4rem',
            background: 'linear-gradient(180deg, #8fd1ff, var(--primary-strong))',
            cursor: 'pointer',
            boxShadow: '0 15px 40px rgba(90, 178, 255, 0.3)'
          }}
        >
          Approve Strategy & Generate Calendar
        </button>
      </div>
    </div>
  );
}
