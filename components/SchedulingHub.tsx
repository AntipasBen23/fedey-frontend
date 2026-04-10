"use client";

import React, { useState } from "react";

interface SchedulingHubProps {
  isOpen: boolean;
  onConfirm: (settings: any) => void;
  onCancel: () => void;
  isApproving: boolean;
}

export default function SchedulingHub({ isOpen, onConfirm, onCancel, isApproving }: SchedulingHubProps) {
  const [step, setStep] = useState(1);
  const [mode, setMode] = useState("smart");
  const [stagger, setStagger] = useState("smart");
  const [startHour, setStartHour] = useState(9); // Default 9 AM
  const [saveAsDefault, setSaveAsDefault] = useState(false);

  if (!isOpen) return null;

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  const modes = [
    { 
      id: "manual", 
      title: "Manual Mode", 
      desc: "You control exactly when posts go live.", 
      icon: "⚙️", 
      detail: "Set fixed time slots per day for total control." 
    },
    { 
      id: "smart", 
      title: "Smart Mode", 
      desc: "AI selects peak engagement times autonomously.", 
      icon: "🧠", 
      detail: "Snipe the best minutes based on platform activity." 
    },
    { 
      id: "hybrid", 
      title: "Hybrid Mode", 
      desc: "Define boundaries, Furci optimizes within.", 
      icon: "🤝", 
      detail: "Set a window (e.g., 9AM-5PM) and let Furci pick the best slot." 
    }
  ];

  const staggers = [
    { 
      id: "none", 
      title: "Same Time", 
      desc: "Post to all platforms at once.", 
      icon: "📣",
      detail: "Best for announcements."
    },
    { 
      id: "fixed", 
      title: "Fixed Stagger", 
      desc: "Spread posts across platforms by 60 mins.", 
      icon: "⏳",
      detail: "Prevents account linking flags."
    },
    { 
      id: "smart", 
      title: "Smart Stagger", 
      desc: "AI determines platform order & delay.", 
      icon: "✨",
      detail: "Optimizes for platform-specific peaks (e.g. X earlier, LinkedIn later)." 
    }
  ];

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'rgba(0, 0, 0, 0.4)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1100,
      animation: 'fadeIn 0.2s ease'
    }}>
      <div style={{
        background: 'white',
        padding: '2.5rem',
        borderRadius: '32px',
        maxWidth: '700px',
        width: '95%',
        boxShadow: '0 30px 60px -12px rgba(0, 0, 0, 0.3)',
        animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
      }}>
        {/* Progress Bar */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
          {[1, 2].map((s) => (
            <div key={s} style={{ 
              flex: 1, 
              height: '6px', 
              borderRadius: '99px', 
              background: s <= step ? 'var(--primary-strong)' : '#f0f0f0',
              transition: 'background 0.3s ease'
            }} />
          ))}
        </div>

        {step === 1 ? (
          <div>
            <h2 style={{ fontSize: '1.8rem', color: '#093f67', marginBottom: '0.5rem' }}>Choose Your Timing Mode ⚙️</h2>
            <p style={{ color: 'var(--muted)', marginBottom: '2rem' }}>Furci can be as flexible or as intelligent as you need.</p>
            
            <div style={{ display: 'grid', gap: '1rem' }}>
              {modes.map((m) => (
                <div 
                  key={m.id}
                  onClick={() => setMode(m.id)}
                  style={{
                    padding: '1.5rem',
                    borderRadius: '20px',
                    border: '2px solid',
                    borderColor: mode === m.id ? 'var(--primary-strong)' : '#f0f0f0',
                    background: mode === m.id ? '#f0f7ff' : 'white',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1.5rem'
                  }}
                >
                  <span style={{ fontSize: '2rem' }}>{m.icon}</span>
                  <div>
                    <div style={{ fontWeight: 800, color: '#093f67' }}>{m.title}</div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>{m.desc}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--primary-strong)', marginTop: '0.3rem', fontWeight: 600 }}>{m.detail}</div>
                  </div>
                </div>
              ))}
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', marginTop: '2.5rem' }}>
              <button onClick={onCancel} style={{ flex: 1, padding: '1.2rem', borderRadius: '16px', border: '2px solid #f0f0f0', background: 'transparent', fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleNext} style={{ flex: 2, padding: '1.2rem', borderRadius: '16px', border: 0, background: 'var(--primary-strong)', color: 'white', fontWeight: 800, cursor: 'pointer' }}>Next: Staggering Strategy →</button>
            </div>
          </div>
        ) : (
          <div>
            <h2 style={{ fontSize: '1.8rem', color: '#093f67', marginBottom: '0.5rem' }}>Staggering Strategy 🛰️</h2>
            <p style={{ color: 'var(--muted)', marginBottom: '2rem' }}>Determine how Furci spaces out posts across different platforms.</p>
            
            <div style={{ display: 'grid', gap: '1rem' }}>
              {staggers.map((s) => (
                <div 
                  key={s.id}
                  onClick={() => setStagger(s.id)}
                  style={{
                    padding: '1.5rem',
                    borderRadius: '20px',
                    border: '2px solid',
                    borderColor: stagger === s.id ? 'var(--primary-strong)' : '#f0f0f0',
                    background: stagger === s.id ? '#f0f7ff' : 'white',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1.5rem'
                  }}
                >
                  <span style={{ fontSize: '2rem' }}>{s.icon}</span>
                  <div>
                    <div style={{ fontWeight: 800, color: '#093f67' }}>{s.title}</div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>{s.desc}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--primary-strong)', marginTop: '0.3rem', fontWeight: 600 }}>{s.detail}</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '2.5rem' }}>
              <button onClick={handleBack} style={{ flex: 1, padding: '1.2rem', borderRadius: '16px', border: '2px solid #f0f0f0', background: 'transparent', fontWeight: 700, cursor: 'pointer' }}>Back</button>
              <button 
                onClick={() => onConfirm({ mode, stagger, startHour, saveAsDefault })} 
                disabled={isApproving}
                style={{ flex: 2, padding: '1.2rem', borderRadius: '16px', border: 0, background: 'var(--primary-strong)', color: 'white', fontWeight: 800, cursor: 'pointer', opacity: isApproving ? 0.6 : 1 }}
              >
                {isApproving ? "Firing Engine..." : "Deploy Intelligent Schedule ⚡"}
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
            <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#f8fbff', borderRadius: '20px', border: '1px solid #e6f4ff' }}>
                <div style={{ fontWeight: 800, color: '#093f67', marginBottom: '1rem' }}>⏰ Timing Precision</div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                    <label style={{ fontSize: '0.9rem', color: 'var(--muted)', fontWeight: 700 }}>Daily Start Time:</label>
                    <select 
                        value={startHour} 
                        onChange={(e) => setStartHour(parseInt(e.target.value))}
                        style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid #ddd', fontWeight: 700 }}
                    >
                        {Array.from({length: 24}).map((_, i) => (
                            <option key={i} value={i}>{i}:00 {i < 12 ? 'AM' : 'PM'}</option>
                        ))}
                    </select>
                </div>

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer' }}>
                    <input 
                        type="checkbox" 
                        checked={saveAsDefault} 
                        onChange={(e) => setSaveAsDefault(e.target.checked)} 
                        style={{ width: '18px', height: '18px' }}
                    />
                    <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#093f67' }}>Save these settings as my default strategy</span>
                </label>
            </div>
        )}

        <style jsx>{`
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          @keyframes slideUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
        `}</style>
      </div>
    </div>
  );
}
