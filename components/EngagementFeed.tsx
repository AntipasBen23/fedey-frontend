"use client";

import { useEffect, useState } from "react";
import { MessageSquare, Ghost, Check, X, RefreshCw, Zap } from "lucide-react";

type EngagementEvent = {
  id: number;
  platform: string;
  type: string;
  externalPostId: string;
  authorHandle: string;
  originalContent: string;
  proposedReply: string;
  status: string;
  createdAt: string;
};

export default function EngagementFeed() {
  const [events, setEvents] = useState<EngagementEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [ghostMode, setGhostMode] = useState(false);
  const [toggling, setToggling] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://fedey-backend-production.up.railway.app";

  const fetchEngagements = async () => {
    try {
      const res = await fetch(`${API_URL}/v1/engagements`);
      if (res.ok) {
        const data = await res.json();
        setEvents(data);
      }
    } catch (e) {
      console.error("Failed to fetch engagements", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEngagements();
    // Fetch initial Ghost Mode status from dashboard data or a specific endpoint
    // For simplicity, we'll sync it when the dashboard loads, but here we can poll or fetch once
  }, []);

  const toggleGhostMode = async () => {
    setToggling(true);
    try {
      const res = await fetch(`${API_URL}/v1/settings/ghost-mode`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: !ghostMode }),
      });
      if (res.ok) {
        setGhostMode(!ghostMode);
      }
    } catch (e) {
      alert("Failed to toggle Ghost Mode");
    } finally {
      setToggling(false);
    }
  };

  const approveReply = async (id: number) => {
    try {
      const res = await fetch(`${API_URL}/v1/engagements/${id}/approve`, { method: "POST" });
      if (res.ok) {
        setEvents(prev => prev.map(e => e.id === id ? { ...e, status: "sent" } : e));
      } else {
        alert("Failed to send reply");
      }
    } catch (e) {
      alert("Error sending reply");
    }
  };

  if (loading) return <div className="p-4 text-center text-sm text-gray-500">Scanning social channels...</div>;

  return (
    <div className="engagement-feed" style={{ background: '#fff', borderRadius: '24px', padding: '1.5rem', border: '1px solid #f0f0f0', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>
          <Zap size={18} color="#f59e0b" fill="#f59e0b" /> Ghost Operator
        </h3>
        
        <div 
          onClick={toggleGhostMode}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            background: ghostMode ? '#f0fdf4' : '#f9fafb', 
            padding: '0.4rem 0.8rem', 
            borderRadius: '12px', 
            cursor: 'pointer',
            border: `1px solid ${ghostMode ? '#bbf7d0' : '#e5e7eb'}`,
            transition: 'all 0.2s ease'
          }}
        >
          <Ghost size={14} color={ghostMode ? '#16a34a' : '#6b7280'} />
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: ghostMode ? '#16a34a' : '#6b7280' }}>
            {ghostMode ? 'FULL AUTO' : 'GHOST MODE'}
          </span>
          <div style={{ 
            width: '28px', 
            height: '16px', 
            background: ghostMode ? '#16a34a' : '#d1d5db', 
            borderRadius: '20px', 
            position: 'relative' 
          }}>
            <div style={{ 
              width: '12px', 
              height: '12px', 
              background: '#fff', 
              borderRadius: '50%', 
              position: 'absolute', 
              top: '2px', 
              left: ghostMode ? '14px' : '2px',
              transition: 'left 0.2s ease'
            }} />
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '500px', overflowY: 'auto', paddingRight: '0.5rem' }}>
        {events.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem 0', color: '#9ca3af' }}>
            <MessageSquare size={32} style={{ margin: '0 auto 0.5rem', opacity: 0.3 }} />
            <p style={{ fontSize: '0.85rem' }}>No interactions found yet.<br/>Furci is scanning your niche.</p>
          </div>
        ) : (
          events.map(event => (
            <div key={event.id} style={{ 
              padding: '1rem', 
              background: event.status === 'sent' ? '#f8fafc' : '#fff', 
              borderRadius: '16px', 
              border: '1px solid #f1f5f9',
              opacity: event.status === 'sent' ? 0.7 : 1
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#6366f1', textTransform: 'uppercase' }}>
                  {event.type.replace('_', ' ')}
                </span>
                <span style={{ fontSize: '0.65rem', color: '#9ca3af' }}>
                  {new Date(event.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              
              <div style={{ fontSize: '0.85rem', color: '#1e293b', marginBottom: '0.8rem', fontStyle: 'italic', background: '#f1f5f9', padding: '0.6rem', borderRadius: '10px' }}>
                " {event.originalContent.substring(0, 100)}{event.originalContent.length > 100 ? '...' : ''} "
                <div style={{ fontSize: '0.7rem', color: '#4f46e5', fontWeight: 700, marginTop: '0.3rem' }}>
                  — @{event.authorHandle}
                </div>
              </div>

              <div style={{ marginBottom: '0.8rem' }}>
                <label style={{ fontSize: '0.65rem', fontWeight: 800, color: '#9ca3af', display: 'block', marginBottom: '0.3rem' }}>FURCI'S TAKE</label>
                <div style={{ fontSize: '0.85rem', color: '#334155', lineHeight: 1.4 }}>
                  {event.proposedReply}
                </div>
              </div>

              {event.status === 'pending' && !ghostMode && (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button 
                    onClick={() => approveReply(event.id)}
                    style={{ flex: 1, background: '#4f46e5', color: '#fff', border: 0, padding: '0.5rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
                  >
                    <Check size={14} /> Send Reply
                  </button>
                  <button style={{ background: '#f1f5f9', color: '#64748b', border: 0, padding: '0.5rem', borderRadius: '8px', cursor: 'pointer' }}>
                    <RefreshCw size={14} />
                  </button>
                </div>
              )}

              {event.status === 'sent' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#16a34a', fontSize: '0.75rem', fontWeight: 700 }}>
                  <Check size={14} /> Published
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
