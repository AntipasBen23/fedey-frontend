"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ConnectPage() {
  const router = useRouter();
  const platforms = [
    { id: "twitter", name: "Twitter (X)", icon: "🐦", color: "#1DA1F2", bg: "#e8f5fe" },
    { id: "linkedin", name: "LinkedIn", icon: "💼", color: "#0A66C2", bg: "#e6f0f9" },
    { id: "tiktok", name: "TikTok", icon: "🎵", color: "#000000", bg: "#e5e5e5" }
  ];

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
        boxShadow: '0 20px 40px rgba(90, 178, 255, 0.1)',
        textAlign: 'center'
      }}>
        <h2 style={{ fontSize: '2.5rem', margin: '0 0 0.5rem', color: 'var(--text)' }}>
          Connect Channels <span className="animate-float">🔌</span>
        </h2>
        <p style={{ margin: '0 0 3rem', color: 'var(--muted)', fontSize: '1.2rem' }}>
          Select the platform where you want me to start managing your presence.
        </p>

        <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'minmax(0, 1fr)' }}>
          {platforms.map((p) => (
            <button 
              key={p.id}
              onClick={() => router.push(`/connect/${p.id}`)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '1rem',
                padding: '1.5rem',
                borderRadius: '16px',
                border: '1px solid #cfe6ff',
                background: p.bg,
                cursor: 'pointer',
                transition: 'transform 0.2s',
                width: '100%'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <span style={{ fontSize: '2rem' }}>{p.icon}</span>
              <span style={{ fontSize: '1.3rem', fontWeight: '700', color: p.color }}>{p.name}</span>
            </button>
          ))}
        </div>

        <div style={{ marginTop: '3rem' }}>
          <Link 
            href="/analysis"
            style={{
              padding: '1rem 3rem',
              borderRadius: '999px',
              color: '#05345a',
              fontWeight: '700',
              background: 'linear-gradient(180deg, #edf7ff, #c7e6ff)',
              textDecoration: 'none',
              border: '1px solid #b7dbff'
            }}
          >
            Go Back
          </Link>
        </div>
      </div>
    </div>
  );
}
