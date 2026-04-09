"use client";

import { useState } from "react";

type ReactionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  topic: string;
  reaction: string;
  loading: boolean;
  onApprove: (content: string) => void;
};

export default function ReactionModal({ isOpen, onClose, topic, reaction, loading, onApprove }: ReactionModalProps) {
  const [content, setContent] = useState(reaction);

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
      zIndex: 1000,
      animation: 'fadeIn 0.3s ease'
    }}>
      <div className="card" style={{
        padding: '3rem',
        borderRadius: '32px',
        maxWidth: '700px',
        width: '90%',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        animation: 'slideUp 0.4s ease'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.8rem', color: '#093f67', margin: 0 }}>AI Trend Reaction ⚡</h2>
            <button onClick={onClose} style={{ background: 'transparent', border: 0, fontSize: '1.5rem', cursor: 'pointer' }}>✕</button>
        </div>

        <div style={{ marginBottom: '1.5rem', padding: '1rem', background: '#f0f7ff', borderRadius: '12px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--primary-strong)', textTransform: 'uppercase' }}>TARGET TREND</span>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text)' }}>{topic}</div>
        </div>

        {loading ? (
             <div style={{ padding: '4rem', textAlign: 'center' }}>
                <div className="spinner" style={{ marginBottom: '1rem' }}></div>
                <p style={{ fontWeight: 700, color: 'var(--muted)' }}>Furci is crafting the perfect take...</p>
             </div>
        ) : (
            <>
                <div style={{ marginBottom: '2rem' }}>
                    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 800, color: 'var(--muted)', marginBottom: '0.5rem' }}>DRAFT CONTENT</label>
                    <textarea 
                        value={content || reaction} 
                        onChange={(e) => setContent(e.target.value)}
                        style={{ 
                            width: '100%', 
                            height: '200px', 
                            padding: '1.5rem', 
                            borderRadius: '16px', 
                            border: '1px solid #e0e0e0',
                            fontSize: '1rem',
                            lineHeight: '1.6',
                            fontFamily: 'inherit',
                            resize: 'none',
                            outline: 'none'
                        }}
                    />
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button 
                        onClick={() => onApprove(content || reaction)}
                        style={{ 
                            flex: 1,
                            padding: '1.2rem', 
                            borderRadius: '16px', 
                            background: 'var(--primary-strong)', 
                            color: 'white', 
                            fontWeight: 800, 
                            border: 0,
                            cursor: 'pointer'
                        }}
                    >
                        Schedule This Reaction 🚀
                    </button>
                </div>
            </>
        )}

        <style jsx>{`
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          @keyframes slideUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
          .spinner {
            width: 40px;
            height: 40px;
            border: 4px solid #f0f0f0;
            border-top: 4px solid var(--primary-strong);
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto;
          }
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        `}</style>
      </div>
    </div>
  );
}
