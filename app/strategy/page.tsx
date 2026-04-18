"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useAuth } from "@/context/AuthContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://fedey-backend-production.up.railway.app";

type StrategyDetail = {
  identityAudit: string;
  trendMonitoring: string[];
  growthExperiments: string[];
  analyticsReporting: string[];
};

export default function StrategyPage() {
  const router = useRouter();
  const { data: session } = useSession() as any;
  const { user, updateUser } = useAuth();
  const [strategy, setStrategy] = useState<StrategyDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [showRefinementUI, setShowRefinementUI] = useState(false);
  const [refinementFeedback, setRefinementFeedback] = useState("");
  const [isRevising, setIsRevising] = useState(false);

  // Track onboarding position
  useEffect(() => {
    fetch(`${API_URL}/v1/user/onboarding`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ lastOnboardingStep: "/strategy" }),
    }).catch(() => {});
    updateUser({ lastOnboardingStep: "/strategy" });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const fetchStrategy = async () => {
      try {
        const productSummary = user?.jobDescription || "your product";

        // Parse platform context from user record
        let platform = "twitter";
        let accountType = "new";
        if (user?.platformContext) {
          try {
            const ctx = JSON.parse(user.platformContext);
            platform = ctx.platform || session?.platform || "twitter";
            accountType = ctx.accountType || "new";
          } catch {
            platform = session?.platform || "twitter";
          }
        } else {
          platform = session?.platform || "twitter";
        }

        const response = await fetch(`${API_URL}/v1/strategy`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ productSummary, platform, accountType }),
        });

        if (!response.ok) throw new Error("Failed to generate professional strategy");

        const data = await response.json();
        setStrategy(data);

        // Handoff OAuth token to backend if session exists
        if (session?.accessToken) {
          setIsSyncing(true);
          await fetch(`${API_URL}/v1/auth/callback`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              accessToken: session.accessToken,
              platform,
              accountType,
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
  }, [session, user?.jobDescription, user?.platformContext]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDisconnect = async () => {
    if (!confirm("Are you sure you want to disconnect your account? This will wipe your tokens.")) return;

    setIsDisconnecting(true);
    try {
      const platform = session?.platform || "twitter";
      await fetch(`${API_URL}/v1/auth/disconnect`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ platform }),
      });

      await signOut({ callbackUrl: "/connect" });
    } catch (err) {
      alert("Failed to disconnect correctly. Please try again.");
    } finally {
      setIsDisconnecting(false);
    }
  };

  const handleRefine = async (mode: "merge" | "replace") => {
    if (!refinementFeedback.trim()) return;
    setIsRevising(true);
    try {
      const productSummary = user?.jobDescription || "your product";

      const response = await fetch(`${API_URL}/v1/strategy/refine`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          currentStrategy: strategy,
          feedback: refinementFeedback,
          productSummary,
          refineMode: mode
        }),
      });

      if (!response.ok) throw new Error("Failed to refine strategy");

      const data = await response.json();
      setStrategy(data);
      setShowRefinementUI(false);
      setRefinementFeedback("");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsRevising(false);
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

      <div style={{ marginTop: '5rem', display: 'flex', gap: '2rem', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          <button
            onClick={() => router.push("/calendar/generate?fresh=1")}
            className="btn-pulse"
            style={{
              border: '0',
              borderRadius: '999px',
              padding: '1.2rem 4rem',
              color: '#05345a',
              fontWeight: '800',
              fontSize: '1.2rem',
              background: 'linear-gradient(180deg, #8fd1ff, var(--primary-strong))',
              cursor: 'pointer',
              boxShadow: '0 15px 40px rgba(90, 178, 255, 0.3)'
            }}
          >
            Approve Strategy & Generate Calendar
          </button>

          <button
            onClick={() => setShowRefinementUI(!showRefinementUI)}
            style={{
              border: '2px solid #cfe6ff',
              borderRadius: '999px',
              padding: '1.2rem 3rem',
              color: '#0c4e7b',
              fontWeight: '700',
              fontSize: '1.1rem',
              background: 'white',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            {showRefinementUI ? "Close Feedback" : "Disapprove & Critique"}
          </button>
        </div>

        {/* Refinement UI */}
        {showRefinementUI && (
          <div className="animate-slide-up" style={{ width: '100%', maxWidth: '700px', marginTop: '2rem', padding: '2rem', background: '#f0f7ff', borderRadius: '24px', border: '1px solid #bfe4ff', textAlign: 'left' }}>
            <h4 style={{ color: '#0c4e7b', margin: '0 0 0.5rem' }}>How can I improve this strategy? 🤔</h4>
            <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Tell Furci about specific corrections or shifts you want (e.g., "Make it more professional" or "Focus more on X").</p>
            <textarea
              value={refinementFeedback}
              onChange={(e) => setRefinementFeedback(e.target.value)}
              placeholder="Your improvements and corrections here..."
              style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid #bfe4ff', minHeight: '120px', fontSize: '1rem', marginBottom: '1.5rem', resize: 'vertical' }}
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <button
                onClick={() => handleRefine("replace")}
                disabled={isRevising || !refinementFeedback.trim()}
                style={{
                  padding: '1.2rem',
                  borderRadius: '16px',
                  background: 'white',
                  border: '2px solid #ffcccc',
                  color: '#c53030',
                  fontWeight: '700',
                  cursor: 'pointer',
                  opacity: isRevising ? 0.6 : 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <span style={{ fontSize: '1.5rem' }}>🔄</span>
                <span>Replace Entirely</span>
                <span style={{ fontSize: '0.7rem', fontWeight: 400, opacity: 0.7 }}>Discard old ideas & start fresh</span>
              </button>

              <button
                onClick={() => handleRefine("merge")}
                disabled={isRevising || !refinementFeedback.trim()}
                style={{
                  padding: '1.2rem',
                  borderRadius: '16px',
                  background: 'white',
                  border: '2px solid #bfe4ff',
                  color: 'var(--primary-strong)',
                  fontWeight: '700',
                  cursor: 'pointer',
                  opacity: isRevising ? 0.6 : 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <span style={{ fontSize: '1.5rem' }}>🤝</span>
                <span>Merge & Improve</span>
                <span style={{ fontSize: '0.7rem', fontWeight: 400, opacity: 0.7 }}>Build on current strategy</span>
              </button>
            </div>

            {isRevising && (
              <p style={{ textAlign: 'center', marginTop: '1rem', color: 'var(--primary-strong)', fontWeight: '600' }} className="animate-pulse">
                Furci is reshaping your strategy...
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
