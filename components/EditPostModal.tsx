"use client";

import { useState, useEffect, useRef } from "react";

type EditPostModalProps = {
  isOpen: boolean;
  onClose: () => void;
  post: {
    id: number;
    content: string;
    scheduledAt: string;
    platform: string;
  };
  onSave: (id: number, content: string, scheduledAt: string) => void;
  onDelete: (id: number) => void;
  initialMode?: "content" | "time";
};

export default function EditPostModal({ isOpen, onClose, post, onSave, onDelete, initialMode }: EditPostModalProps) {
  const [content, setContent] = useState(post.content);
  const [scheduledAt, setScheduledAt] = useState(post.scheduledAt.split('.')[0]); // Strip ms for datetime-local

  const contentRef = useRef<HTMLTextAreaElement>(null);
  const timeRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
        setTimeout(() => {
            if (initialMode === "content") contentRef.current?.focus();
            else if (initialMode === "time") timeRef.current?.focus();
        }, 100);
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

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
      zIndex: 1200,
      animation: 'fadeIn 0.2s ease'
    }}>
      <div className="card" style={{
        padding: '2.5rem',
        borderRadius: '32px',
        maxWidth: '600px',
        width: '90%',
        boxShadow: '0 30px 60px rgba(0,0,0,0.2)',
        animation: 'slideUp 0.3s ease'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.6rem', color: '#093f67', margin: 0 }}>Customize Your Strategy ⚙️</h2>
            <button onClick={onClose} style={{ background: 'transparent', border: 0, fontSize: '1.5rem', cursor: 'pointer' }}>✕</button>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: 'var(--muted)', marginBottom: '0.5rem' }}>PROPS & COPY</label>
            <textarea 
                ref={contentRef}
                value={content} 
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your viral hook here..."
                style={{ 
                    width: '100%', 
                    height: '150px', 
                    padding: '1.2rem', 
                    borderRadius: '16px', 
                    border: '1px solid #e0e0e0',
                    fontSize: '1rem',
                    lineHeight: '1.5',
                    fontFamily: 'inherit',
                    resize: 'none'
                }}
            />
        </div>

        <div style={{ marginBottom: '2.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: 'var(--muted)', marginBottom: '0.5rem' }}>TIMING PREFERENCE ({post.platform.toUpperCase()})</label>
            <input 
                ref={timeRef}
                type="datetime-local" 
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                style={{ 
                    width: '100%', 
                    padding: '1rem', 
                    borderRadius: '12px', 
                    border: '1px solid #e0e0e0',
                    fontSize: '1rem',
                    fontWeight: 700
                }}
            />
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
            <button 
                onClick={() => onSave(post.id, content, scheduledAt)}
                style={{ 
                    flex: 2,
                    padding: '1.2rem', 
                    borderRadius: '16px', 
                    background: 'var(--primary-strong)', 
                    color: 'white', 
                    fontWeight: 800, 
                    border: 0,
                    cursor: 'pointer'
                }}
            >
                Save Changes 💾
            </button>
            <button 
                onClick={() => {
                    if(confirm("Permanently remove this post?")) onDelete(post.id);
                }}
                style={{ 
                    flex: 1,
                    padding: '1.2rem', 
                    borderRadius: '16px', 
                    background: '#fff0f0', 
                    color: '#ff4d4d', 
                    fontWeight: 800, 
                    border: '1px solid #ffdcdc',
                    cursor: 'pointer'
                }}
            >
                Delete 🗑️
            </button>
        </div>

        <style jsx>{`
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          @keyframes slideUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
        `}</style>
      </div>
    </div>
  );
}
