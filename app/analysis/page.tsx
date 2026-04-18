"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://fedey-backend-production.up.railway.app";

type StrategyReport = {
  summary: string;
  audience: string[];
  competitors: string[];
};

export default function AnalysisPage() {
  const router = useRouter();
  const { user, updateUser } = useAuth();

  const [analyzingState, setAnalyzingState] = useState<string>("Initializing intelligence...");
  const [report, setReport] = useState<StrategyReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Track onboarding position
  useEffect(() => {
    fetch(`${API_URL}/v1/user/onboarding`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ lastOnboardingStep: "/analysis" }),
    }).catch(() => {});
    updateUser({ lastOnboardingStep: "/analysis" });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const doAnalysis = async () => {
      try {
        const textToAnalyze = user?.jobDescription;
        if (!textToAnalyze) {
          setError("No job description found. Please go back and submit one.");
          return;
        }

        const stages = [
          "Reading job description...",
          "Identifying target audiences...",
          "Scouting competitors...",
          "Finalizing strategy..."
        ];

        let stageIndex = 0;
        const interval = setInterval(() => {
          if (stageIndex < stages.length) {
            setAnalyzingState(stages[stageIndex]);
            stageIndex++;
          }
        }, 1500);

        const response = await fetch(`${API_URL}/v1/analyze`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ jobDescription: textToAnalyze }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to analyze job description");
        }

        const result = await response.json();
        clearInterval(interval);
        setReport(result as StrategyReport);
      } catch (err: any) {
        setError(err.message || "An unexpected error occurred during analysis.");
      }
    };

    // Wait until user is loaded before running analysis
    if (user !== undefined) {
      doAnalysis();
    }
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  if (error) {
    return (
      <div className="page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', textAlign: 'center' }}>
        <div className="hero animate-fade-in-up" style={{
          padding: '3rem',
          maxWidth: '500px',
          background: 'linear-gradient(145deg, #fff5f5, #ffffff)',
          border: '1px solid #ffcccc',
          borderRadius: '24px',
          boxShadow: '0 15px 35px rgba(255, 0, 0, 0.05)'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
          <h2 style={{ color: '#c53030', margin: '0 0 1rem' }}>Analysis Interrupted</h2>
          <p style={{ color: '#742a2a', fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '2rem' }}>
            {error}
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button
              onClick={() => router.push("/hire")}
              style={{
                padding: '0.9rem 1.8rem',
                borderRadius: '12px',
                border: '1px solid #ffcccc',
                background: 'white',
                color: '#c53030',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Go Back
            </button>
            <button
              onClick={() => window.location.reload()}
              className="btn-pulse"
              style={{
                padding: '0.9rem 1.8rem',
                borderRadius: '12px',
                border: 0,
                background: 'linear-gradient(180deg, #feb2b2, #f56565)',
                color: 'white',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              Retry Analysis
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', textAlign: 'center' }}>
        <div className="animate-float" style={{ fontSize: '4rem', marginBottom: '1rem' }}>🤖</div>
        <h2 style={{ color: 'var(--text)', fontSize: '2rem' }}>{analyzingState}</h2>
        <p style={{ color: 'var(--muted)' }}>This usually takes a few seconds...</p>
      </div>
    );
  }

  return (
    <div className="page" style={{ padding: '3rem 1rem', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', color: 'var(--text)', margin: '0 0 0.5rem' }}>Strategy Blueprint 🚀</h1>
        <p style={{ color: 'var(--muted)', fontSize: '1.2rem', margin: 0 }}>
          I've analyzed your requirements. Here's your custom game plan.
        </p>
      </div>

      <div style={{ display: 'grid', gap: '2rem' }}>
        {/* Summary Card */}
        <div className="brand-card" style={{ padding: '2rem', borderRadius: '24px', border: '1px solid var(--border)' }}>
          <h3 style={{ margin: '0 0 1rem', color: '#0c4e7b', fontSize: '1.5rem' }}>Product / Service Summary</h3>
          <p style={{ fontSize: '1.2rem', lineHeight: '1.6', color: 'var(--text)', margin: 0 }}>
            {report.summary}
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          {/* Audience Card */}
          <div className="trend-card" style={{ padding: '2rem', borderRadius: '24px', border: '1px solid var(--border)' }}>
            <h3 style={{ margin: '0 0 1rem', color: '#0c4e7b', fontSize: '1.5rem' }}>Target Audiences</h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '1rem' }}>
              {report.audience.map((aud, i) => (
                <li key={i} style={{ padding: '1rem', background: 'rgba(255, 255, 255, 0.8)', borderRadius: '12px', border: '1px solid #d8edff', fontWeight: '500' }}>
                  🎯 {aud}
                </li>
              ))}
            </ul>
          </div>

          {/* Competitors Card */}
          <div className="publishing-card" style={{ padding: '2rem', borderRadius: '24px', border: '1px solid var(--border)' }}>
            <h3 style={{ margin: '0 0 1rem', color: '#0c4e7b', fontSize: '1.5rem' }}>Main Competitors</h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '1rem' }}>
              {report.competitors.length > 0 ? (
                report.competitors.map((comp, i) => (
                  <li key={i} style={{ padding: '1rem', background: 'rgba(255, 255, 255, 0.8)', borderRadius: '12px', border: '1px solid #d8edff', fontWeight: '500' }}>
                    ⚔️ {comp}
                  </li>
                ))
              ) : (
                <p>No explicit competitors identified.</p>
              )}
            </ul>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '4rem', textAlign: 'center' }}>
        <button
          onClick={() => router.push("/connect")}
          className="btn-pulse"
          style={{
            border: '0',
            borderRadius: '999px',
            padding: '1.2rem 3rem',
            color: '#05345a',
            fontWeight: '700',
            fontSize: '1.3rem',
            background: 'linear-gradient(180deg, #8fd1ff, var(--primary-strong))',
            cursor: 'pointer',
            boxShadow: '0 10px 30px rgba(90, 178, 255, 0.25)'
          }}
        >
          Login to your social media account
        </button>
      </div>
    </div>
  );
}
