"use client";

import React, { useState, useEffect } from "react";
import { Clock, Sliders, Zap, Calendar, ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";

interface SchedulingHubProps {
  isOpen: boolean;
  onConfirm: (settings: any) => void;
  onCancel: () => void;
  isApproving: boolean;
  items: any[]; // The calendar posts to schedule
}

export default function SchedulingHub({ isOpen, onConfirm, onCancel, isApproving, items }: SchedulingHubProps) {
  const [step, setStep] = useState(1);
  const [mode, setMode] = useState("smart");
  const [stagger, setStagger] = useState("smart");
  
  // State for different modes
  const [postSchedules, setPostSchedules] = useState<any[]>([]);
  const [timeWindow, setTimeWindow] = useState("morning");
  const [saveAsDefault, setSaveAsDefault] = useState(false);

  // Initialize post schedules based on items count
  useEffect(() => {
    if (items && items.length > 0) {
      setPostSchedules(items.map((item, idx) => ({
        day: item.day || (idx + 1),
        hour: 9,
        minute: 0
      })));
    }
  }, [items]);

  if (!isOpen) return null;

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  const updatePostTime = (idx: number, hour: number, minute: number) => {
    const next = [...postSchedules];
    next[idx] = { ...next[idx], hour, minute };
    setPostSchedules(next);
  };

  const modes = [
    { 
      id: "manual", 
      title: "Manual Mode", 
      desc: "Total precision. You set the date and time for every post.", 
      icon: <Sliders size={24} />, 
      color: "#4f46e5"
    },
    { 
      id: "smart", 
      title: "Smart Mode", 
      desc: "Autonomous peak-time sniping. AI target peak engagement.", 
      icon: <Zap size={24} />, 
      color: "#f59e0b"
    },
    { 
      id: "hybrid", 
      title: "Hybrid Mode", 
      desc: "Set a window, Furci finds the hottest minute inside.", 
      icon: <Clock size={24} />, 
      color: "#10b981"
    }
  ];

  const staggers = [
    { 
      id: "none", 
      title: "Same Time", 
      desc: "Post to all platforms at once (Announcements).", 
      icon: "📣"
    },
    { 
      id: "fixed", 
      title: "Fixed Stagger", 
      desc: "Spread posts by 60 mins (Platform Safety).", 
      icon: "⏳"
    },
    { 
      id: "smart", 
      title: "Smart Stagger", 
      desc: "AI staggers based on platform-specific peaks.", 
      icon: "✨"
    }
  ];

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
      background: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(12px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1100, animation: 'fadeIn 0.2s ease'
    }}>
      <div style={{
        background: 'white', padding: '2.5rem', borderRadius: '32px',
        maxWidth: '750px', width: '95%', overflowY: 'auto', maxHeight: '90vh',
        boxShadow: '0 30px 60px -12px rgba(0, 0, 0, 0.3)',
        animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        position: 'relative'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '2rem', color: '#1e293b', fontWeight: 900, marginBottom: '0.5rem' }}>
               Scheduling Engine ⚡
            </h2>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                {[1, 2].map(s => (
                    <div key={s} style={{ 
                        width: '40px', height: '6px', borderRadius: '10px',
                        background: s <= step ? 'var(--primary-strong)' : '#f1f5f9'
                    }} />
                ))}
            </div>
        </div>

        {step === 1 ? (
          <div>
            <div style={{ display: 'grid', gap: '1rem' }}>
              {modes.map((m) => (
                <div 
                  key={m.id}
                  onClick={() => setMode(m.id)}
                  style={{
                    padding: '1.5rem', borderRadius: '24px', border: '2px solid',
                    borderColor: mode === m.id ? m.color : '#f1f5f9',
                    background: mode === m.id ? `${m.color}08` : 'white',
                    cursor: 'pointer', transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    display: 'flex', alignItems: 'center', gap: '1.5rem',
                    position: 'relative'
                  }}
                >
                  <div style={{ 
                    width: '50px', height: '50px', borderRadius: '14px', 
                    background: mode === m.id ? m.color : '#f8fafc', 
                    color: mode === m.id ? 'white' : '#94a3b8',
                    display: 'flex', alignItems: 'center', justifyContent: 'center' 
                  }}>
                    {m.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, color: '#1e293b', fontSize: '1.1rem' }}>{m.title}</div>
                    <div style={{ fontSize: '0.9rem', color: '#64748b', marginTop: '0.2rem' }}>{m.desc}</div>
                  </div>
                  {mode === m.id && (
                      <div style={{ color: m.color }}><CheckCircle2 size={24} /></div>
                  )}
                </div>
              ))}
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', marginTop: '2.5rem' }}>
              <button onClick={onCancel} style={{ flex: 1, padding: '1.1rem', borderRadius: '16px', border: '2px solid #f1f5f9', background: 'transparent', color: '#64748b', fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleNext} style={{ flex: 2, padding: '1.1rem', borderRadius: '16px', border: 0, background: 'var(--primary-strong)', color: 'white', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                Next: Configure Details <ArrowRight size={18} />
              </button>
            </div>
          </div>
        ) : (
          <div>
            <h3 style={{ fontSize: '1.4rem', color: '#1e293b', marginBottom: '1.5rem', fontWeight: 800 }}>
                {mode === 'manual' ? "Define Precise Slots" : mode === 'hybrid' ? "Select Time Window" : "Growth Intelligence"}
            </h3>

            {/* Manual Mode Slot List */}
            {mode === 'manual' && (
                <div style={{ maxHeight: '350px', overflowY: 'auto', paddingRight: '0.5rem', display: 'grid', gap: '0.8rem' }} className="custom-scroll">
                    {postSchedules.map((slot, idx) => (
                        <div key={idx} style={{ padding: '1rem 1.5rem', background: '#f8fafc', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid #e2e8f0' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                <div style={{ background: 'var(--primary-strong)', color: 'white', fontWeight: 900, borderRadius: '8px', padding: '0.2rem 0.6rem', fontSize: '0.8rem' }}>
                                    DAY {slot.day}
                                </div>
                                <span style={{ fontWeight: 700, color: '#475569', fontSize: '0.9rem' }}>Post Slot</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <select 
                                    value={slot.hour === 0 ? 12 : slot.hour > 12 ? slot.hour - 12 : slot.hour}
                                    onChange={(e) => {
                                        const h12 = parseInt(e.target.value);
                                        const isPM = slot.hour >= 12;
                                        let h24 = h12;
                                        if (isPM && h12 < 12) h24 += 12;
                                        if (!isPM && h12 === 12) h24 = 0;
                                        updatePostTime(idx, h24, slot.minute);
                                    }}
                                    style={{ padding: '0.5rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontWeight: 700, appearance: 'none', background: 'white', minWidth: '55px', textAlign: 'center' }}
                                >
                                    {Array.from({length: 12}).map((_, h) => (
                                        <option key={h+1} value={h+1}>{(h+1) < 10 ? `0${h+1}` : h+1}</option>
                                    ))}
                                </select>
                                <span style={{ fontWeight: 900, color: '#cbd5e1' }}>:</span>
                                <select 
                                    value={slot.minute}
                                    onChange={(e) => updatePostTime(idx, slot.hour, parseInt(e.target.value))}
                                    style={{ padding: '0.5rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontWeight: 700, appearance: 'none', background: 'white', minWidth: '55px', textAlign: 'center' }}
                                >
                                    {[0, 15, 30, 45].map(m => (
                                        <option key={m} value={m}>{m < 10 ? `0${m}` : m}</option>
                                    ))}
                                </select>
                                <select 
                                    value={slot.hour >= 12 ? "PM" : "AM"}
                                    onChange={(e) => {
                                        const period = e.target.value;
                                        let h24 = slot.hour % 12;
                                        if (period === "PM") h24 += 12;
                                        updatePostTime(idx, h24, slot.minute);
                                    }}
                                    style={{ padding: '0.5rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontWeight: 900, background: '#f8fafc', color: 'var(--primary-strong)' }}
                                >
                                    <option value="AM">AM</option>
                                    <option value="PM">PM</option>
                                </select>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Hybrid Window Selector */}
            {mode === 'hybrid' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                    {["morning", "afternoon", "evening"].map(w => (
                        <button
                            key={w}
                            onClick={() => setTimeWindow(w)}
                            style={{
                                padding: '1.5rem 1rem', borderRadius: '20px', border: '2px solid',
                                borderColor: timeWindow === w ? 'var(--primary-strong)' : '#f1f5f9',
                                background: timeWindow === w ? '#f0f7ff' : 'white',
                                cursor: 'pointer', transition: 'all 0.2s ease',
                                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.8rem'
                            }}
                        >
                            <span style={{ fontSize: '1.5rem' }}>{w === 'morning' ? '🌅' : w === 'afternoon' ? '☀️' : '🌙'}</span>
                            <span style={{ fontWeight: 800, color: '#1e293b', textTransform: 'capitalize' }}>{w}</span>
                            <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                                {w === 'morning' ? '7 AM - 11 AM' : w === 'afternoon' ? '12 PM - 5 PM' : '6 PM - 11 PM'}
                            </span>
                        </button>
                    ))}
                </div>
            )}

            {/* Smart Mode Stats */}
            {mode === 'smart' && (
                <div style={{ padding: '2rem', background: 'linear-gradient(135deg, #f0f7ff, #eef2ff)', borderRadius: '24px', textAlign: 'center', border: '1px solid #e0e7ff' }}>
                    <div style={{ background: 'white', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: '#f59e0b', boxShadow: '0 8px 20px rgba(0,0,0,0.05)' }}>
                        <Zap size={30} fill="currentColor" />
                    </div>
                    <h4 style={{ fontWeight: 900, color: '#1e293b', marginBottom: '0.5rem' }}>AI-Informed Sniping</h4>
                    <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: 1.6 }}>
                        Furci will scan your past performance metrics and cross-reference with industry-standard global traffic peaks to find the absolute "hottest" moments to publish.
                    </p>
                </div>
            )}

            {/* Stagger Config */}
            <div style={{ marginTop: '2rem' }}>
                <h4 style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>
                    Staggering Strategy
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.8rem' }}>
                    {staggers.map(s => (
                        <div 
                            key={s.id}
                            onClick={() => setStagger(s.id)}
                            style={{
                                padding: '1rem', borderRadius: '16px', border: '2px solid',
                                borderColor: stagger === s.id ? 'var(--primary-strong)' : '#f1f5f9',
                                background: stagger === s.id ? '#f0f7ff' : 'white',
                                cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s ease'
                            }}
                        >
                            <div style={{ fontSize: '1.2rem', marginBottom: '0.3rem' }}>{s.icon}</div>
                            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#1e293b' }}>{s.title}</div>
                        </div>
                    ))}
                </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '2.5rem' }}>
              <button onClick={handleBack} style={{ flex: 1, padding: '1.1rem', borderRadius: '16px', border: '2px solid #f1f5f9', background: 'transparent', color: '#64748b', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <ArrowLeft size={18} /> Back
              </button>
              <button 
                onClick={() => onConfirm({ mode, stagger, postSchedules, timeWindow, saveAsDefault })} 
                disabled={isApproving}
                style={{ flex: 2, padding: '1.1rem', borderRadius: '16px', border: 0, background: 'var(--primary-strong)', color: 'white', fontWeight: 800, cursor: 'pointer', opacity: isApproving ? 0.6 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              >
                {isApproving ? "Firing Engine..." : "Deploy Schedule 🚀"}
              </button>
            </div>
            
            <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer' }}>
                    <input 
                        type="checkbox" 
                        checked={saveAsDefault} 
                        onChange={(e) => setSaveAsDefault(e.target.checked)} 
                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569' }}>Save as my master strategy</span>
                </label>
            </div>
          </div>
        )}

        <style jsx>{`
          .custom-scroll::-webkit-scrollbar { width: 4px; }
          .custom-scroll::-webkit-scrollbar-track { background: #f1f5f9; }
          .custom-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; borderRadius: 10px; }
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          @keyframes slideUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
        `}</style>
      </div>
    </div>
  );
}
