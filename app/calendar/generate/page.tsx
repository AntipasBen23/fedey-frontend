"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAutopilot } from "@/app/context/AutopilotContext";
import Link from "next/link";
import SuccessModal from "@/components/SuccessModal";
import SchedulingHub from "@/components/SchedulingHub";

type CalendarItem = {
  day: number;
  hook: string;
  content: string;
  media: string;
};

export default function CalendarGeneratePage() {
  const router = useRouter();
  const { isAutopilot } = useAutopilot();
  
  const [calendar, setCalendar] = useState<CalendarItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revisionFeedback, setRevisionFeedback] = useState("");
  const [revising, setRevising] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [showHub, setShowHub] = useState(false);

  useEffect(() => {
    const fetchCalendar = async () => {
      try {
        const productSummary = localStorage.getItem("furciJobDescription") || "your product";
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://fedey-backend-production.up.railway.app";
        
        const response = await fetch(`${apiUrl}/v1/calendar`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productSummary }),
        });

        if (!response.ok) throw new Error("Failed to generate content calendar");

        const data = await response.json();
        setCalendar(data.calendar);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCalendar();
  }, []);

  const handleEdit = (index: number, field: keyof CalendarItem, value: any) => {
    const next = [...calendar];
    next[index] = { ...next[index], [field]: value };
    setCalendar(next);
  };

  const handleRevise = async () => {
    if (!revisionFeedback.trim()) return;
    setRevising(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
      const response = await fetch(`${apiUrl}/v1/revise`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          currentCalendar: calendar, 
          feedback: revisionFeedback 
        }),
      });

      if (!response.ok) throw new Error("Failed to revise calendar");

      const data = await response.json();
      setCalendar(data.calendar);
      setRevisionFeedback("");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setRevising(false);
    }
  };

  const handleApprove = async (settings: any) => {
    setIsApproving(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://fedey-backend-production.up.railway.app";
      const response = await fetch(`${apiUrl}/v1/calendar/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          schedulingMode: settings.mode,
          staggerStrategy: settings.stagger
        })
      });

      if (!response.ok) throw new Error("Failed to approve calendar");
      
      setShowHub(false);
      setShowSuccess(true);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsApproving(false);
    }
  };

  if (loading) {
    return (
      <div className="page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
        <div className="animate-float" style={{ fontSize: '4rem', marginBottom: '1rem' }}>📅</div>
        <h2 style={{ color: 'var(--text)', fontSize: '2rem' }}>Drafting your 3-Day Trial...</h2>
        <p style={{ color: 'var(--muted)' }}>Crafting hooks and content for your initial brand presence.</p>
      </div>
    );
  }

  return (
    <div className="page" style={{ padding: '3rem 1rem', maxWidth: '1100px', margin: '0 auto' }}>
      <SuccessModal 
        isOpen={showSuccess} 
        onClose={() => setShowSuccess(false)} 
        title="Calendar Scheduled! 🚀" 
        message="Furci has successfully queued your 3-day content runway. Your dashboard is now active."
      />

      <SchedulingHub 
        isOpen={showHub}
        onConfirm={handleApprove}
        onCancel={() => setShowHub(false)}
        isApproving={isApproving}
      />

      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', color: 'var(--text)', margin: '0' }}>3-Day Growth Runway 🗓️</h1>
        <p style={{ color: 'var(--muted)', fontSize: '1.2rem', marginTop: '0.5rem' }}>
           Review, edit, and approve your initial content trial.
        </p>
      </div>

      <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
        {calendar.map((item, index) => (
          <div key={index} className="card brand-card" style={{ padding: '1.5rem', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 800, color: 'var(--primary-strong)' }}>DAY {item.day}</span>
              <span className="badge">{item.media}</span>
            </div>
            
            <div style={{ display: 'grid', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, opacity: 0.6 }}>HOOK</label>
              <textarea 
                value={item.hook}
                onChange={(e) => handleEdit(index, "hook", e.target.value)}
                rows={2}
                style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: '1px solid #dceeff', fontSize: '0.95rem', resize: 'none' }}
              />
            </div>

            <div style={{ display: 'grid', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, opacity: 0.6 }}>CONTENT</label>
              <textarea 
                value={item.content}
                onChange={(e) => handleEdit(index, "content", e.target.value)}
                rows={4}
                style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: '1px solid #dceeff', fontSize: '0.95rem', resize: 'vertical' }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Revision Loop */}
      <div style={{ marginTop: '4rem', padding: '3rem', background: 'linear-gradient(160deg, #f0f7ff, #ffffff)', borderRadius: '32px', border: '1px solid var(--border)', textAlign: 'center' }}>
        <h3 style={{ fontSize: '1.8rem', color: 'var(--text)', marginBottom: '1rem' }}>Not quite right? 🤔</h3>
        <p style={{ color: 'var(--muted)', marginBottom: '2rem' }}>Tell Furci what to change (e.g., "Make it more funny" or "Focus more on the tech side").</p>
        
        <div style={{ display: 'flex', gap: '1rem', maxWidth: '800px', margin: '0 auto' }}>
          <textarea 
            value={revisionFeedback}
            onChange={(e) => setRevisionFeedback(e.target.value)}
            disabled={revising}
            placeholder="Type your complaints or suggestions here..."
            style={{ flex: 1, padding: '1.2rem', borderRadius: '16px', border: '1px solid #cfe6ff', fontSize: '1.1rem' }}
          />
          <button 
            onClick={handleRevise}
            disabled={revising || !revisionFeedback.trim()}
            style={{ padding: '0 2rem', borderRadius: '16px', background: 'var(--primary-strong)', color: 'white', fontWeight: 700, cursor: 'pointer', opacity: revising ? 0.6 : 1 }}
          >
            {revising ? "Reshaping..." : "Revise"}
          </button>
        </div>
      </div>

      <div style={{ marginTop: '4rem', textAlign: 'center' }}>
        <button
          onClick={() => setShowHub(true)}
          className="btn-pulse"
          style={{
            border: '0',
            borderRadius: '999px',
            padding: '1.5rem 5rem',
            color: '#05345a',
            fontWeight: '800',
            fontSize: '1.5rem',
            background: 'linear-gradient(180deg, #8fd1ff, var(--primary-strong))',
            cursor: 'pointer',
            boxShadow: '0 15px 40px rgba(90, 178, 255, 0.3)'
          }}
        >
          Approve & Configure Schedule
        </button>
      </div>
    </div>
  );
}
