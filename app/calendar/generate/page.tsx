"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAutopilot } from "@/app/context/AutopilotContext";
import Link from "next/link";
import SuccessModal from "@/components/SuccessModal";
import SchedulingHub from "@/components/SchedulingHub";
import ErrorModal from "@/components/ErrorModal";
import ScriptModal from "@/components/ScriptModal";

type CalendarItem = {
  day: number;
  hook: string;
  content: string;
  media: string;
  contentType: "tweet" | "thread" | "carousel" | "video_script" | "linkedin_post" | "";
  script: string;
  slides: string[];
  hashtags: string[];
  visualPrompt: string;
  ctaText: string;
};

export default function CalendarGeneratePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isFresh = searchParams.get("fresh") === "1";
  const { isAutopilot } = useAutopilot();
  
  const [calendar, setCalendar] = useState<CalendarItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revisionFeedback, setRevisionFeedback] = useState("");
  const [revising, setRevising] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [showHub, setShowHub] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [scriptItem, setScriptItem] = useState<CalendarItem | null>(null);

  useEffect(() => {
    const checkStatusAndFetch = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://fedey-backend-production.up.railway.app";
        
        // 1. Pre-flight Status Check — skip if coming fresh from strategy approval
        if (!isFresh) {
          const statusRes = await fetch(`${apiUrl}/v1/calendar/status`);
          if (statusRes.ok) {
            const { status } = await statusRes.json();
            if (status === "scheduled") {
              router.push("/dashboard");
              return;
            }
          }
        }

        // 2. Fetch/Generate Calendar
        const productSummary = localStorage.getItem("furciJobDescription") || "your product";
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

    checkStatusAndFetch();
  }, [router, isFresh]);

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
          staggerStrategy: settings.stagger,
          postSchedules: settings.postSchedules,
          timeWindow: settings.timeWindow,
          saveAsDefault: settings.saveAsDefault
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to approve calendar");
      }
      
      setShowHub(false);
      setShowSuccess(true);
    } catch (err: any) {
      setErrorMsg(err.message);
      setShowError(true);
    } finally {
      setIsApproving(false);
    }
  };

  const contentTypeConfig: Record<string, { label: string; color: string; bg: string; icon: string }> = {
    tweet:          { label: "Tweet",         color: "#1d9bf0", bg: "#e8f5fe", icon: "𝕏" },
    thread:         { label: "Thread",        color: "#1565c0", bg: "#e3f0ff", icon: "🧵" },
    carousel:       { label: "Carousel",      color: "#7b2ff7", bg: "#f3e8ff", icon: "🖼️" },
    video_script:   { label: "Video Script",  color: "#d32f2f", bg: "#fdecea", icon: "🎬" },
    linkedin_post:  { label: "LinkedIn Post", color: "#0a66c2", bg: "#e8f0f9", icon: "💼" },
  };

  const getTypeConfig = (type: string) =>
    contentTypeConfig[type] || { label: type || "Post", color: "#555", bg: "#f0f0f0", icon: "📝" };

  const hasRichContent = (item: CalendarItem) =>
    (item.script && item.script.length > 0) ||
    (item.slides && item.slides.length > 0);

  if (loading) {
    return (
      <div className="page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
        <div className="animate-float" style={{ fontSize: '4rem', marginBottom: '1rem' }}>📅</div>
        <h2 style={{ color: 'var(--text)', fontSize: '2rem' }}>Drafting your 3-Day Trial...</h2>
        <p style={{ color: 'var(--muted)' }}>Writing scripts, carousels, and content tailored to your brand.</p>
      </div>
    );
  }

  return (
    <div className="page" style={{ padding: '3rem 1rem', maxWidth: '1100px', margin: '0 auto' }}>
      <SuccessModal
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        title="Calendar Scheduled!"
        message="Furci has successfully queued your 3-day content runway. Your dashboard is now active."
      />

      <SchedulingHub
        isOpen={showHub}
        onConfirm={handleApprove}
        onCancel={() => setShowHub(false)}
        isApproving={isApproving}
        items={calendar}
      />

      <ErrorModal
        isOpen={showError}
        onClose={() => setShowError(false)}
        title="Scheduling Blocked"
        message={errorMsg}
      />

      {scriptItem && (
        <ScriptModal
          item={scriptItem}
          onClose={() => setScriptItem(null)}
        />
      )}

      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', color: 'var(--text)', margin: '0' }}>3-Day Growth Runway</h1>
        <p style={{ color: 'var(--muted)', fontSize: '1.2rem', marginTop: '0.5rem' }}>
          Scripts, carousels, and posts — ready to publish.
        </p>
      </div>

      <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
        {calendar.map((item, index) => {
          const typeConfig = getTypeConfig(item.contentType);
          return (
            <div key={index} className="card brand-card" style={{ padding: '1.5rem', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Header row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 800, color: 'var(--primary-strong)' }}>DAY {item.day}</span>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <span style={{
                    fontSize: '0.75rem', fontWeight: 700, padding: '0.25rem 0.75rem',
                    borderRadius: '999px', background: typeConfig.bg, color: typeConfig.color,
                    letterSpacing: '0.03em'
                  }}>
                    {typeConfig.icon} {typeConfig.label}
                  </span>
                </div>
              </div>

              {/* Visual direction badge */}
              {item.media && (
                <div style={{ fontSize: '0.78rem', color: '#666', background: '#f7f7f7', borderRadius: '8px', padding: '0.4rem 0.75rem' }}>
                  📷 {item.media}
                </div>
              )}

              {/* Hook */}
              <div style={{ display: 'grid', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, opacity: 0.5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Hook</label>
                <textarea
                  value={item.hook}
                  onChange={(e) => handleEdit(index, "hook", e.target.value)}
                  rows={2}
                  style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: '1px solid #dceeff', fontSize: '0.95rem', resize: 'none', boxSizing: 'border-box' }}
                />
              </div>

              {/* Content body (tweet, linkedin_post) */}
              {(item.contentType === "tweet" || item.contentType === "linkedin_post" || !item.contentType) && (
                <div style={{ display: 'grid', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, opacity: 0.5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Content</label>
                  <textarea
                    value={item.content}
                    onChange={(e) => handleEdit(index, "content", e.target.value)}
                    rows={4}
                    style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: '1px solid #dceeff', fontSize: '0.95rem', resize: 'vertical', boxSizing: 'border-box' }}
                  />
                </div>
              )}

              {/* Thread preview */}
              {item.contentType === "thread" && item.script && (
                <div style={{ background: '#f0f7ff', borderRadius: '10px', padding: '0.75rem', fontSize: '0.9rem', color: '#1d9bf0', borderLeft: '3px solid #1d9bf0' }}>
                  {item.script.split('\n')[0]?.slice(0, 120)}...
                </div>
              )}

              {/* Carousel slide count */}
              {item.contentType === "carousel" && item.slides && item.slides.length > 0 && (
                <div style={{ background: '#f3e8ff', borderRadius: '10px', padding: '0.75rem', fontSize: '0.9rem', color: '#7b2ff7', borderLeft: '3px solid #7b2ff7' }}>
                  {item.slides.length} slides ready — Slide 1: "{item.slides[0]?.slice(0, 80)}"
                </div>
              )}

              {/* Video script preview */}
              {item.contentType === "video_script" && item.script && (
                <div style={{ background: '#fdecea', borderRadius: '10px', padding: '0.75rem', fontSize: '0.9rem', color: '#d32f2f', borderLeft: '3px solid #d32f2f' }}>
                  {item.script.split('\n')[0]?.slice(0, 120)}...
                </div>
              )}

              {/* Hashtags */}
              {item.hashtags && item.hashtags.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {item.hashtags.map((tag, i) => (
                    <span key={i} style={{ fontSize: '0.78rem', background: '#e8f0ff', color: '#1a56db', borderRadius: '999px', padding: '0.2rem 0.6rem', fontWeight: 600 }}>
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* CTA */}
              {item.ctaText && (
                <div style={{ fontSize: '0.82rem', color: '#444', fontStyle: 'italic', borderTop: '1px solid #eee', paddingTop: '0.5rem' }}>
                  CTA: {item.ctaText}
                </div>
              )}

              {/* View full script button */}
              {hasRichContent(item) && (
                <button
                  onClick={() => setScriptItem(item)}
                  style={{
                    marginTop: '0.25rem', padding: '0.65rem 1.2rem', borderRadius: '10px',
                    background: typeConfig.bg, color: typeConfig.color,
                    border: `1.5px solid ${typeConfig.color}`, fontWeight: 700,
                    fontSize: '0.85rem', cursor: 'pointer', width: '100%',
                  }}
                >
                  {item.contentType === "carousel" ? `View All ${item.slides?.length} Slides` :
                   item.contentType === "thread" ? "View Full Thread" :
                   item.contentType === "video_script" ? "View Full Script" : "View Content"}
                </button>
              )}
            </div>
          );
        })}
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
