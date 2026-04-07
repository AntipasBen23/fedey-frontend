"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { analyzeJobDescription } from "@/app/actions/analyze";

type StrategyReport = {
  summary: string;
  audience: string[];
  competitors: string[];
};

export default function AnalysisPage() {
  const router = useRouter();
  
  const [analyzingState, setAnalyzingState] = useState<string>("Initializing intelligence...");
  const [report, setReport] = useState<StrategyReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const doAnalysis = async () => {
      try {
        const textToAnalyze = localStorage.getItem("furciJobDescription");
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

        // Simulate reading stages visually
        let stageIndex = 0;
        const interval = setInterval(() => {
          if (stageIndex < stages.length) {
            setAnalyzingState(stages[stageIndex]);
            stageIndex++;
          }
        }, 1500);

        // Actual API call
        const result = await analyzeJobDescription(textToAnalyze);
        
        clearInterval(interval);
        setReport(result as StrategyReport);
      } catch (err: any) {
        setError(err.message || "An unexpected error occurred during analysis.");
      }
    };

    doAnalysis();
  }, []);

  if (error) {
    return (
      <div className="page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', textAlign: 'center' }}>
        <div style={{ padding: '2rem', background: '#ffebee', borderRadius: '16px', color: '#b71c1c' }}>
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={() => router.push("/hire")} style={{ padding: '0.8rem 1.5rem', marginTop: '1rem', borderRadius: '8px', border: 0, cursor: 'pointer' }}>Go Back</button>
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
