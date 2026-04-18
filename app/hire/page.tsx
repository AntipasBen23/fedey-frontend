"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function HirePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Track onboarding position — so home page knows to show "Continue onboarding"
  useEffect(() => {
    localStorage.setItem("furci_return_url", "/hire");
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const text = formData.get("jobDescription") as string;
    
    // Pass via localStorage so analysis page can pick it up locally
    localStorage.setItem("furciJobDescription", text);
    
    router.push("/analysis");
  }

  return (
    <div className="page" style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '80vh' 
    }}>
      <div className="hero animate-fade-in-up" style={{ 
        width: '100%', 
        maxWidth: '700px', 
        padding: '3rem 2.5rem',
        background: 'linear-gradient(160deg, rgba(255, 255, 255, 0.98), rgba(236, 247, 255, 0.98))',
        border: '1px solid var(--border)',
        borderRadius: '24px',
        boxShadow: '0 20px 40px rgba(90, 178, 255, 0.1)'
      }}>
        <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <h2 style={{ fontSize: '2.5rem', margin: '0 0 0.5rem', color: 'var(--text)' }}>
            Tell me what you need <span className="animate-float">📝</span>
          </h2>
          <p style={{ margin: 0, color: 'var(--muted)', fontSize: '1.1rem' }}>
            Paste your job description or requirements below, and I'll get straight to work.
          </p>
        </div>
        
        <form className="onboarding-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'grid', gap: '0.8rem' }}>
            <label htmlFor="jobDescription" style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--text)' }}>
              Job Description
            </label>
            <textarea 
              id="jobDescription"
              name="jobDescription" 
              rows={8} 
              placeholder="E.g., I need a social media manager to grow my tech startup's Twitter account..."
              style={{
                width: '100%',
                padding: '1.5rem',
                borderRadius: '16px',
                border: '2px solid #cfe6ff',
                background: 'rgba(255, 255, 255, 0.9)',
                color: 'var(--text)',
                fontSize: '1.1rem',
                lineHeight: '1.6',
                resize: 'vertical',
                boxShadow: 'inset 0 2px 10px rgba(90, 178, 255, 0.05)'
              }}
              required
              disabled={loading}
            />
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
             <Link 
              href="/"
              style={{
                flex: 1,
                textAlign: 'center',
                padding: '1.2rem',
                borderRadius: '16px',
                color: '#05345a',
                fontWeight: '700',
                fontSize: '1.1rem',
                background: 'linear-gradient(180deg, #edf7ff, #c7e6ff)',
                textDecoration: 'none',
                border: '1px solid #b7dbff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: loading ? 'none' : 'auto',
                opacity: loading ? 0.6 : 1
              }}
            >
              Back
            </Link>
            <button 
              type="submit"
              className={loading ? "" : "btn-pulse"}
              disabled={loading}
              style={{
                flex: 2,
                border: '0',
                borderRadius: '16px',
                padding: '1.2rem',
                color: '#05345a',
                fontWeight: '700',
                fontSize: '1.1rem',
                background: 'linear-gradient(180deg, #8fd1ff, var(--primary-strong))',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: '0 10px 20px rgba(90, 178, 255, 0.2)',
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? "Preparing..." : "Start Autopilot"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
