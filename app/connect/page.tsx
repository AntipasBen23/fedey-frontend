"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ConnectPage() {
  const router = useRouter();
  const platforms = [
    { 
      id: "twitter", 
      name: "Twitter (X)", 
      logo: "https://upload.wikimedia.org/wikipedia/commons/5/53/X_logo_2023_original.svg", 
      color: "#000000", 
      bg: "#ffffff",
      active: true 
    },
    { 
      id: "linkedin", 
      name: "LinkedIn", 
      logo: "https://upload.wikimedia.org/wikipedia/commons/8/81/LinkedIn_icon.svg", 
      color: "#0A66C2", 
      bg: "#ffffff",
      active: false 
    },
    { 
      id: "tiktok", 
      name: "TikTok", 
      logo: "https://upload.wikimedia.org/wikipedia/en/a/a9/TikTok_logo.svg", 
      color: "#000000", 
      bg: "#ffffff",
      active: false 
    }
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
              onClick={() => p.active ? router.push(`/connect/${p.id}`) : null}
              disabled={!p.active}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1.5rem 2rem',
                borderRadius: '20px',
                border: p.active ? '1px solid #cfe6ff' : '1px solid #eee',
                background: p.bg,
                cursor: p.active ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s',
                width: '100%',
                opacity: p.active ? 1 : 0.7,
                boxShadow: p.active ? '0 4px 12px rgba(90, 178, 255, 0.08)' : 'none'
              }}
              onMouseOver={(e) => p.active && (e.currentTarget.style.transform = 'scale(1.02)')}
              onMouseOut={(e) => p.active && (e.currentTarget.style.transform = 'scale(1)')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                <div style={{ 
                  width: '48px', 
                  height: '48px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  background: '#f9f9f9',
                  borderRadius: '12px',
                  padding: '8px'
                }}>
                  <img src={p.logo} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </div>
                <span style={{ fontSize: '1.3rem', fontWeight: '800', color: p.active ? p.color : '#999' }}>{p.name}</span>
              </div>
              
              {!p.active && (
                <span style={{ 
                  fontSize: '0.75rem', 
                  fontWeight: '800', 
                  padding: '0.4rem 0.8rem', 
                  background: '#f0f0f0', 
                  color: '#999', 
                  borderRadius: '999px',
                  letterSpacing: '0.5px'
                }}>
                  COMING SOON
                </span>
              )}
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
